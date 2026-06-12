<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, x-admin-passcode");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

// Handle OPTIONS preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// 1. Load .env file
function loadEnv() {
    $envPath = __DIR__ . '/.env';
    if (file_exists($envPath)) {
        $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || strpos($line, '#') === 0) continue;
            if (strpos($line, '=') === false) continue;
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);
            // Remove surrounding quotes if any
            if (preg_match('/^["\'](.*)["\']$/', $value, $matches)) {
                $value = $matches[1];
            }
            $_ENV[$name] = $value;
            putenv("$name=$value");
        }
    }
}
loadEnv();

// 2. Database path setup
define('DB_FILE', __DIR__ . '/data/db.json');

function readDb() {
    if (!file_exists(DB_FILE)) {
        return ['bookings' => [], 'inventory' => [], 'settings' => ['tentPlannerEnabled' => true]];
    }
    $content = file_get_contents(DB_FILE);
    return json_decode($content, true) ?: ['bookings' => [], 'inventory' => [], 'settings' => ['tentPlannerEnabled' => true]];
}

function writeDb($data) {
    // Create directory if not exists
    $dir = dirname(DB_FILE);
    if (!file_exists($dir)) {
        mkdir($dir, 0755, true);
    }
    file_put_contents(DB_FILE, json_encode($data, JSON_PRETTY_PRINT));
}

// 3. Auth Helper
function checkAuth() {
    $passcode = isset($_SERVER['HTTP_X_ADMIN_PASSCODE']) ? $_SERVER['HTTP_X_ADMIN_PASSCODE'] : '';
    if (empty($passcode) && isset($_GET['passcode'])) {
        $passcode = $_GET['passcode'];
    }
    $expected = isset($_ENV['ADMIN_PASSCODE']) ? $_ENV['ADMIN_PASSCODE'] : getenv('ADMIN_PASSCODE');
    if (!$expected) $expected = "pinstripes123";
    return $passcode === $expected;
}

// 4. Availability Calculator
function getItemAvailability($itemId, $date, $db) {
    $item = null;
    foreach ($db['inventory'] as $inv) {
        if ($inv['id'] == $itemId) {
            $item = $inv;
            break;
        }
    }
    if (!$item) {
        return ['totalStock' => 0, 'rented' => 0, 'available' => 0];
    }
    
    $totalStock = 5;
    if ($item['category'] === "Chairs") $totalStock = 500;
    else if ($item['category'] === "Tables") $totalStock = 50;
    else if ($item['category'] === "Tents") $totalStock = 8;
    else if ($item['category'] === "Bounce Houses" || $item['category'] === "Water Slides") $totalStock = 3;
    
    if (isset($item['stock']) && is_numeric($item['stock'])) {
        $totalStock = (int)$item['stock'];
    }
    
    $rented = 0;
    foreach ($db['bookings'] as $booking) {
        if (isset($booking['event']['date']) && $booking['event']['date'] === $date) {
            if (isset($booking['items'][$itemId])) {
                $rented += (int)$booking['items'][$itemId];
            }
        }
    }
    
    return [
        'totalStock' => $totalStock,
        'rented' => $rented,
        'available' => max(0, $totalStock - $rented)
    ];
}

// 5. Email Sender (Resend API)
function sendQuoteEmail($payload) {
    $apiKey = isset($_ENV['RESEND_API_KEY']) ? $_ENV['RESEND_API_KEY'] : getenv('RESEND_API_KEY');
    
    $db = readDb();
    $inventory = isset($db['inventory']) ? $db['inventory'] : [];
    
    $itemsListHtml = '';
    foreach ($payload['items'] as $id => $qty) {
        $item = null;
        foreach ($inventory as $inv) {
            if ($inv['id'] == $id) {
                $item = $inv;
                break;
            }
        }
        
        $title = $item ? $item['title'] : "Item #$id";
        $price = $item ? (float)$item['price'] : 0.0;
        $total = $price * $qty;
        
        $itemsListHtml .= "
        <tr>
            <td style=\"padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px; color: #333333;\">
                <strong>" . htmlspecialchars($title) . "</strong>
            </td>
            <td style=\"padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px; color: #666666; text-align: center;\">
                $qty
            </td>
            <td style=\"padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px; color: #666666; text-align: right;\">
                $" . number_format($price, 2) . "
            </td>
            <td style=\"padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px; color: #333333; text-align: right; font-weight: bold;\">
                $" . number_format($total, 2) . "
            </td>
        </tr>";
    }

    $notesHtml = '';
    if (!empty($payload['notes'])) {
        $notesHtml = "
        <div style=\"margin-bottom: 25px;\">
            <h3 style=\"font-size: 14px; color: #0f0f0f; margin-bottom: 6px;\">Customer Notes / Special Requests:</h3>
            <div style=\"background-color: #f9f9f9; padding: 12px 15px; border-left: 3px solid #D4AF37; font-size: 13px; color: #555555; line-height: 1.5; border-radius: 0 4px 4px 0;\">
                " . nl2br(htmlspecialchars($payload['notes'])) . "
            </div>
        </div>";
    }

    $emailHtml = "
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset=\"utf-8\">
        <title>New Quote Request - " . htmlspecialchars($payload['ref']) . "</title>
      </head>
      <body style=\"font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 20px; color: #333333;\">
        <div style=\"max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e1e1e1;\">
          <div style=\"background-color: #0f0f0f; padding: 30px; text-align: center; border-bottom: 3px solid #D4AF37;\">
            <p style=\"color: #D4AF37; font-size: 11px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 5px 0;\">Pinstripes Party &amp; Event Rentals</p>
            <h1 style=\"color: #ffffff; font-size: 22px; font-weight: 700; margin: 0; letter-spacing: -0.02em;\">New Quote Request</h1>
            <div style=\"display: inline-block; background-color: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.3); border-radius: 9999px; padding: 4px 12px; font-size: 12px; color: #D4AF37; font-weight: 600; margin-top: 12px;\">
              Ref: " . htmlspecialchars($payload['ref']) . "
            </div>
          </div>
          <div style=\"padding: 30px;\">
            <h2 style=\"font-size: 16px; border-bottom: 1px solid #D4AF37; padding-bottom: 8px; color: #0f0f0f; margin-top: 0;\">Customer Information</h2>
            <table style=\"width: 100%; border-collapse: collapse; margin-bottom: 25px;\">
              <tr>
                <td style=\"padding: 6px 0; font-size: 14px; color: #666666; width: 120px;\">Name:</td>
                <td style=\"padding: 6px 0; font-size: 14px; color: #0f0f0f; font-weight: 600;\">" . htmlspecialchars($payload['customer']['name']) . "</td>
              </tr>
              <tr>
                <td style=\"padding: 6px 0; font-size: 14px; color: #666666;\">Email:</td>
                <td style=\"padding: 6px 0; font-size: 14px; color: #0f0f0f;\"><a href=\"mailto:" . htmlspecialchars($payload['customer']['email']) . "\" style=\"color: #D4AF37; text-decoration: none; font-weight: 500;\">" . htmlspecialchars($payload['customer']['email']) . "</a></td>
              </tr>
              <tr>
                <td style=\"padding: 6px 0; font-size: 14px; color: #666666;\">Phone:</td>
                <td style=\"padding: 6px 0; font-size: 14px; color: #0f0f0f;\"><a href=\"tel:" . htmlspecialchars($payload['customer']['phone']) . "\" style=\"color: #D4AF37; text-decoration: none; font-weight: 500;\">" . htmlspecialchars($payload['customer']['phone']) . "</a></td>
              </tr>
            </table>
            <h2 style=\"font-size: 16px; border-bottom: 1px solid #D4AF37; padding-bottom: 8px; color: #0f0f0f;\">Event &amp; Delivery Details</h2>
            <table style=\"width: 100%; border-collapse: collapse; margin-bottom: 25px;\">
              <tr>
                <td style=\"padding: 6px 0; font-size: 14px; color: #666666; width: 120px;\">Event Type:</td>
                <td style=\"padding: 6px 0; font-size: 14px; color: #0f0f0f; font-weight: 500;\">" . htmlspecialchars($payload['event']['type']) . "</td>
              </tr>
              <tr>
                <td style=\"padding: 6px 0; font-size: 14px; color: #666666;\">Event Date:</td>
                <td style=\"padding: 6px 0; font-size: 14px; color: #0f0f0f; font-weight: 500;\">" . htmlspecialchars($payload['event']['date']) . "</td>
              </tr>
              <tr>
                <td style=\"padding: 6px 0; font-size: 14px; color: #666666;\">Guest Count:</td>
                <td style=\"padding: 6px 0; font-size: 14px; color: #0f0f0f;\">" . htmlspecialchars($payload['event']['guestCount']) . " guests</td>
              </tr>
              <tr>
                <td style=\"padding: 6px 0; font-size: 14px; color: #666666;\">Delivery Address:</td>
                <td style=\"padding: 6px 0; font-size: 14px; color: #0f0f0f;\">
                  " . htmlspecialchars($payload['delivery']['address']) . "<br>
                  " . htmlspecialchars($payload['delivery']['city']) . ", VA " . htmlspecialchars($payload['delivery']['zipCode']) .
                "</td>
              </tr>
              <tr>
                <td style=\"padding: 6px 0; font-size: 14px; color: #666666;\">Setup Location:</td>
                <td style=\"padding: 6px 0; font-size: 14px; color: #0f0f0f;\">" . htmlspecialchars($payload['event']['location']) . "</td>
              </tr>
            </table>
            <h2 style=\"font-size: 16px; border-bottom: 1px solid #D4AF37; padding-bottom: 8px; color: #0f0f0f;\">Requested Rentals</h2>
            <table style=\"width: 100%; border-collapse: collapse; margin-bottom: 25px;\">
              <thead>
                <tr style=\"background-color: #f9f9f9;\">
                  <th style=\"padding: 10px 12px; font-size: 12px; font-weight: 600; color: #666666; text-align: left; border-bottom: 2px solid #eeeeee;\">Item</th>
                  <th style=\"padding: 10px 12px; font-size: 12px; font-weight: 600; color: #666666; text-align: center; border-bottom: 2px solid #eeeeee; width: 60px;\">Qty</th>
                  <th style=\"padding: 10px 12px; font-size: 12px; font-weight: 600; color: #666666; text-align: right; border-bottom: 2px solid #eeeeee; width: 80px;\">Rate</th>
                  <th style=\"padding: 10px 12px; font-size: 12px; font-weight: 600; color: #666666; text-align: right; border-bottom: 2px solid #eeeeee; width: 90px;\">Total</th>
                </tr>
              </thead>
              <tbody>
                $itemsListHtml
              </tbody>
            </table>
            <div style=\"background-color: #fdfbf7; border: 1px solid #f3ebd3; border-radius: 6px; padding: 20px; margin-bottom: 25px;\">
              <table style=\"width: 100%; border-collapse: collapse;\">
                <tr>
                  <td style=\"font-size: 14px; color: #666666; padding-bottom: 8px;\">Payment Method Preference:</td>
                  <td style=\"font-size: 14px; color: #0f0f0f; font-weight: 600; text-align: right; padding-bottom: 8px;\">" . htmlspecialchars($payload['paymentMethod']) . "</td>
                </tr>
                <tr style=\"border-top: 1px dashed #e5dec9; font-size: 16px;\">
                  <td style=\"font-weight: 700; color: #0f0f0f; padding-top: 12px;\">Estimated Rental Total:</td>
                  <td style=\"font-weight: 800; color: #0f0f0f; text-align: right; padding-top: 12px; font-size: 18px;\">$" . number_format($payload['estimatedTotal'], 2) . "</td>
                </tr>
              </table>
            </div>
            $notesHtml
            <p style=\"font-size: 12px; color: #999999; margin: 0; text-align: center;\">
              Submitted on " . date('Y-m-d H:i:s', strtotime($payload['submittedAt'])) . "
            </p>
          </div>
          <div style=\"background-color: #f7f7f7; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;\">
            <p style=\"font-size: 12px; color: #999999; margin: 0;\">
              This is an automated request notification from the Pinstripes Rentals website portal.
            </p>
          </div>
        </div>
      </body>
    </html>";

    if (!$apiKey || $apiKey === 're_your_api_key_here') {
        error_log("[EMAIL FALLBACK - NO RESEND API KEY SET] To: pinstripesrentals@gmail.com, Ref: " . $payload['ref']);
        return ['success' => true, 'error' => 'Resend API key missing; logged successfully to server console.'];
    }

    $ch = curl_init('https://api.resend.com/emails');
    $headers = [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json'
    ];
    
    $body = json_encode([
        'from' => 'Pinstripes Rentals <onboarding@resend.dev>',
        'to' => ['pinstripesrentals@gmail.com'],
        'replyTo' => $payload['customer']['email'],
        'subject' => 'New Quote Request: ' . $payload['ref'] . ' - ' . $payload['customer']['name'],
        'html' => $emailHtml
    ]);
    
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode >= 200 && $httpCode < 300) {
        $resData = json_decode($response, true);
        return ['success' => true, 'id' => isset($resData['id']) ? $resData['id'] : null];
    } else {
        error_log("[Resend Error]: Code $httpCode, Response: $response");
        $resData = json_decode($response, true);
        return ['success' => false, 'error' => isset($resData['message']) ? $resData['message'] : 'Unknown Resend error'];
    }
}

// 6. Router logic
$route = isset($_GET['route']) ? trim($_GET['route'], '/') : '';

// GET /api/inventory
if ($route === 'inventory') {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
        exit;
    }
    
    $db = readDb();
    $allItems = isset($db['inventory']) ? $db['inventory'] : [];
    $available = array_values(array_filter($allItems, function($item) {
        return !isset($item['availability']) || $item['availability'] !== false;
    }));
    
    echo json_encode(['success' => true, 'items' => $available]);
    exit;
}

// GET /api/availability
if ($route === 'availability') {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
        exit;
    }
    
    $date = isset($_GET['date']) ? $_GET['date'] : '';
    if (empty($date)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Date parameter is required (format: YYYY-MM-DD)']);
        exit;
    }
    
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid date format. Expected YYYY-MM-DD']);
        exit;
    }
    
    $db = readDb();
    $allItems = isset($db['inventory']) ? $db['inventory'] : [];
    $availability = [];
    foreach ($allItems as $item) {
        $availability[$item['id']] = getItemAvailability($item['id'], $date, $db);
    }
    
    echo json_encode(['success' => true, 'date' => $date, 'availability' => $availability]);
    exit;
}

// GET /api/settings
if ($route === 'settings') {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
        exit;
    }
    
    $db = readDb();
    $settings = isset($db['settings']) ? $db['settings'] : ['tentPlannerEnabled' => true];
    echo json_encode(array_merge(['success' => true], $settings));
    exit;
}

// POST /api/quote
if ($route === 'quote') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
        exit;
    }
    
    // Simple Rate Limit Check (5 requests / 15 mins)
    $ip = isset($_SERVER['HTTP_X_FORWARDED_FOR']) ? explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0] : (isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'unknown');
    $ip = trim($ip);
    
    $rlFile = __DIR__ . '/data/ratelimits.json';
    $rlData = [];
    if (file_exists($rlFile)) {
        $rlData = json_decode(file_get_contents($rlFile), true) ?: [];
    }
    
    $now = time();
    $window = 15 * 60;
    
    foreach ($rlData as $key => $timestamps) {
        $rlData[$key] = array_filter($timestamps, function($ts) use ($now, $window) {
            return ($now - $ts) < $window;
        });
        if (empty($rlData[$key])) {
            unset($rlData[$key]);
        }
    }
    
    if (!isset($rlData[$ip])) {
        $rlData[$ip] = [];
    }
    
    if (count($rlData[$ip]) >= 5) {
        $oldest = min($rlData[$ip]);
        $retryAfterSec = ($oldest + $window) - $now;
        http_response_code(429);
        header('Retry-After: ' . $retryAfterSec);
        header('X-RateLimit-Remaining: 0');
        echo json_encode([
            'success' => false,
            'error' => 'Too many requests. Please wait a few minutes before submitting again.',
            'retryAfter' => $retryAfterSec * 1000
        ]);
        file_put_contents($rlFile, json_encode($rlData));
        exit;
    }
    
    $rlData[$ip][] = $now;
    file_put_contents($rlFile, json_encode($rlData));

    // Parse Body
    $body = json_decode(file_get_contents('php://input'), true);
    if (!$body || !is_array($body)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid request body. Expected JSON.']);
        exit;
    }

    // Sanitize & Validate
    $firstName = isset($body['firstName']) ? trim($body['firstName']) : '';
    $lastName = isset($body['lastName']) ? trim($body['lastName']) : '';
    $email = isset($body['email']) ? trim($body['email']) : '';
    $phone = isset($body['phone']) ? trim($body['phone']) : '';
    $eventType = isset($body['eventType']) ? trim($body['eventType']) : '';
    $eventDate = isset($body['eventDate']) ? trim($body['eventDate']) : '';
    $eventLocation = isset($body['eventLocation']) ? trim($body['eventLocation']) : '';
    $guestCount = isset($body['guestCount']) ? trim($body['guestCount']) : '';
    $address = isset($body['address']) ? trim($body['address']) : '';
    $city = isset($body['city']) ? trim($body['city']) : '';
    $customCity = isset($body['customCity']) ? trim($body['customCity']) : '';
    $zipCode = isset($body['zipCode']) ? trim($body['zipCode']) : '';
    $selectedItems = isset($body['selectedItems']) ? $body['selectedItems'] : [];
    $estimatedTotal = isset($body['estimatedTotal']) ? (float)$body['estimatedTotal'] : 0.0;
    $paymentMethod = isset($body['paymentMethod']) ? trim($body['paymentMethod']) : '';
    $notes = isset($body['notes']) ? trim($body['notes']) : '';

    $errors = [];
    if (empty($firstName)) $errors['firstName'] = 'First name is required.';
    if (empty($lastName)) $errors['lastName'] = 'Last name is required.';
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors['email'] = 'Valid email is required.';
    if (empty($phone)) $errors['phone'] = 'Phone number is required.';
    if (empty($eventDate) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $eventDate)) $errors['eventDate'] = 'Event date is required.';
    if (empty($address)) $errors['address'] = 'Delivery address is required.';
    if (empty($city)) $errors['city'] = 'City is required.';
    if ($city === 'Other' && empty($customCity)) $errors['customCity'] = 'Custom city is required.';
    if (empty($zipCode)) $errors['zipCode'] = 'Zip code is required.';
    if (empty($selectedItems) || !is_array($selectedItems)) $errors['selectedItems'] = 'At least one item must be selected.';
    if (empty($paymentMethod)) $errors['paymentMethod'] = 'Payment method preference is required.';

    if (!empty($errors)) {
        http_response_code(422);
        echo json_encode(['success' => false, 'error' => 'Validation failed.', 'fieldErrors' => $errors]);
        exit;
    }

    $deliveryCity = ($city === 'Other') ? $customCity : $city;
    $quoteRef = 'PSR-' . strtoupper(base_convert(time() * 1000, 10, 36));

    $itemCount = 0;
    foreach ($selectedItems as $qty) {
        $itemCount += (int)$qty;
    }

    $quoteSummary = [
        'ref' => $quoteRef,
        'customer' => [
            'name' => "$firstName $lastName",
            'email' => $email,
            'phone' => $phone,
        ],
        'event' => [
            'type' => $eventType,
            'date' => $eventDate,
            'location' => $eventLocation,
            'guestCount' => (int)$guestCount,
        ],
        'delivery' => [
            'address' => $address,
            'city' => $deliveryCity,
            'zipCode' => $zipCode,
        ],
        'items' => $selectedItems,
        'itemCount' => $itemCount,
        'estimatedTotal' => $estimatedTotal,
        'paymentMethod' => $paymentMethod,
        'notes' => $notes,
        'submittedAt' => date('c'),
    ];

    // Send email via Resend
    sendQuoteEmail($quoteSummary);

    // Save booking
    $db = readDb();
    if (!isset($db['bookings'])) $db['bookings'] = [];
    $db['bookings'][] = [
        'id' => $quoteRef,
        'customer' => $quoteSummary['customer'],
        'event' => $quoteSummary['event'],
        'delivery' => $quoteSummary['delivery'],
        'items' => $quoteSummary['items'],
        'itemCount' => $quoteSummary['itemCount'],
        'estimatedTotal' => $quoteSummary['estimatedTotal'],
        'paymentMethod' => $quoteSummary['paymentMethod'],
        'notes' => $quoteSummary['notes'],
        'submittedAt' => $quoteSummary['submittedAt'],
    ];
    writeDb($db);

    header('X-Quote-Ref: ' . $quoteRef);
    echo json_encode([
        'success' => true,
        'message' => "Your quote request has been received! We'll contact you within 24 hours.",
        'quoteRef' => $quoteRef
    ]);
    exit;
}

// GET /api/portal/lookup
if ($route === 'portal/lookup') {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
        exit;
    }
    
    $ref = isset($_GET['ref']) ? strtoupper(trim($_GET['ref'])) : '';
    $email = isset($_GET['email']) ? strtolower(trim($_GET['email'])) : '';
    
    $isAdmin = checkAuth();

    if (empty($ref)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Ref parameter is required.']);
        exit;
    }

    $db = readDb();
    $bookings = isset($db['bookings']) ? $db['bookings'] : [];
    $booking = null;
    foreach ($bookings as $b) {
        if (strtoupper($b['id']) === $ref) {
            $booking = $b;
            break;
        }
    }

    if (!$booking) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'No booking found with that reference number.']);
        exit;
    }

    if (!$isAdmin) {
        if (empty($email)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Email address is required for customer lookup.']);
            exit;
        }
        if (strtolower($booking['customer']['email']) !== $email) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Email address does not match our records for that booking reference.']);
            exit;
        }
    }

    echo json_encode(['success' => true, 'booking' => $booking]);
    exit;
}

// Admin Routes Protection check
$isAdminRoute = (strpos($route, 'admin/') === 0);
if ($isAdminRoute) {
    if (!checkAuth()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Unauthorized']);
        exit;
    }
}

// GET /api/admin/bookings
if ($route === 'admin/bookings') {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
        exit;
    }
    
    $db = readDb();
    $bookings = isset($db['bookings']) ? $db['bookings'] : [];
    
    // Sort bookings: newest submitted first
    usort($bookings, function($a, $b) {
        return strtotime($b['submittedAt']) - strtotime($a['submittedAt']);
    });
    
    echo json_encode(['success' => true, 'bookings' => $bookings]);
    exit;
}

// GET & POST /api/admin/inventory
if ($route === 'admin/inventory') {
    $db = readDb();
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $items = isset($db['inventory']) ? $db['inventory'] : [];
        echo json_encode(['success' => true, 'items' => $items]);
        exit;
    }
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true);
        $action = isset($body['action']) ? $body['action'] : '';
        $item = isset($body['item']) ? $body['item'] : null;
        
        if ($action === 'update') {
            if (!isset($item['id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Item ID is required for updates']);
                exit;
            }
            
            $foundIndex = -1;
            foreach ($db['inventory'] as $idx => $inv) {
                if ($inv['id'] == $item['id']) {
                    $foundIndex = $idx;
                    break;
                }
            }
            
            if ($foundIndex === -1) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Item not found']);
                exit;
            }
            
            $db['inventory'][$foundIndex] = array_merge($db['inventory'][$foundIndex], $item);
            writeDb($db);
            
            echo json_encode(['success' => true, 'item' => $db['inventory'][$foundIndex]]);
            exit;
        }
        
        if ($action === 'create') {
            if (empty($item['title']) || empty($item['category'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Title and Category are required']);
                exit;
            }
            
            // Generate a unique ID (based on max ID + 1)
            $maxId = 0;
            foreach ($db['inventory'] as $inv) {
                if (is_numeric($inv['id']) && (int)$inv['id'] > $maxId) {
                    $maxId = (int)$inv['id'];
                }
            }
            $newId = (string)($maxId + 1);
            
            $newItem = array_merge([
                'id' => $newId,
                'rating' => 5.0,
                'reviews' => 0,
                'availability' => true
            ], $item);
            
            $db['inventory'][] = $newItem;
            writeDb($db);
            
            echo json_encode(['success' => true, 'item' => $newItem]);
            exit;
        }
        
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => "Invalid action. Expected 'update' or 'create'."]);
        exit;
    }
}

// POST /api/admin/settings
if ($route === 'admin/settings') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
        exit;
    }
    
    $body = json_decode(file_get_contents('php://input'), true);
    if (!isset($body['tentPlannerEnabled']) || !is_bool($body['tentPlannerEnabled'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid parameters']);
        exit;
    }
    
    $db = readDb();
    if (!isset($db['settings'])) $db['settings'] = [];
    $db['settings']['tentPlannerEnabled'] = $body['tentPlannerEnabled'];
    writeDb($db);
    
    echo json_encode(['success' => true, 'message' => 'Settings saved successfully']);
    exit;
}

// POST /api/admin/upload
if ($route === 'admin/upload') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
        exit;
    }
    
    if (!isset($_FILES['file']) || !isset($_POST['itemId'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'File and Item ID are required']);
        exit;
    }
    
    $file = $_FILES['file'];
    $itemId = $_POST['itemId'];
    
    // Images upload directory: public_html/images/uploads
    // public_html/api/index.php is located in public_html/api/
    // So target is dirname(__DIR__) . '/images/uploads'
    $uploadDir = dirname(__DIR__) . '/images/uploads';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    $fileExt = pathinfo($file['name'], PATHINFO_EXTENSION);
    if (!$fileExt) $fileExt = 'png';
    $baseName = preg_replace('/[^a-zA-Z0-9]/', '_', pathinfo($file['name'], PATHINFO_FILENAME));
    $filename = $itemId . '_' . time() . '_' . $baseName . '.' . $fileExt;
    $filePath = $uploadDir . '/' . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $filePath)) {
        $imagePath = '/images/uploads/' . $filename;
        
        $db = readDb();
        $updated = false;
        foreach ($db['inventory'] as &$inv) {
            if ($inv['id'] == $itemId) {
                $inv['image'] = $imagePath;
                $updated = true;
                break;
            }
        }
        if ($updated) {
            writeDb($db);
            echo json_encode(['success' => true, 'imagePath' => $imagePath]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Item not found in database']);
        }
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to upload image']);
    }
    exit;
}

// Catch all: Route not found
http_response_code(404);
echo json_encode(['success' => false, 'error' => 'Route not found.']);
exit;
