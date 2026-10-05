<?php
/**
 * Lumaro Furniture Studio — Contact Form Mail Handler
 * Runs on xneelo Apache / PHP 8.2 with SSL SMTP delivery
 */

declare(strict_types=1);

// Set CORS headers for xneelo hosting and local dev
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight browser check
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed. Only POST is supported.']);
    exit;
}

$rawInput = file_get_contents('php://input');
$payload = json_decode($rawInput, true);

if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON payload received.']);
    exit;
}

$name = trim((string)($payload['name'] ?? ''));
$email = trim((string)($payload['email'] ?? ''));
$phone = trim((string)($payload['phone'] ?? ''));
$subject = trim((string)($payload['subject'] ?? ''));
$message = trim((string)($payload['message'] ?? ''));
$product = $payload['interestedProduct'] ?? null;

// Validation
if (empty($name) || empty($email) || empty($subject) || empty($message)) {
    http_response_code(422);
    echo json_encode(['error' => 'Please fill in all required fields (name, email, subject, message).']);
    exit;
}

// Basic email pattern check
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['error' => 'Please enter a valid email address.']);
    exit;
}

// xneelo Outgoing SMTP Configuration
$smtpHost = 'smtp.lumarofurniture.co.za';
$smtpPort = 465;
$smtpUser = 'enquiries@lumarofurniture.co.za';
$smtpPass = 'LumaroFurniture@123#';
$studioRecipient = 'enquiries@lumarofurniture.co.za';

/**
 * Send email via direct SSL socket to xneelo SMTP
 */
function sendSmtpEmail(
    string $host,
    int $port,
    string $username,
    string $password,
    string $from,
    string $fromName,
    string $to,
    string $replyTo,
    string $subject,
    string $htmlBody
): bool {
    $socket = @fsockopen("ssl://{$host}", $port, $errno, $errstr, 15);
    if (!$socket) {
        return false;
    }

    $read = function () use ($socket): string {
        $res = '';
        while ($str = fgets($socket, 515)) {
            $res .= $str;
            if (substr($str, 3, 1) === ' ') break;
        }
        return $res;
    };

    $write = function (string $cmd) use ($socket, $read): string {
        fputs($socket, $cmd . "\r\n");
        return $read();
    };

    $read(); // Initial server greeting
    $write("EHLO " . gethostname());
    $write("AUTH LOGIN");
    $write(base64_encode($username));
    $write(base64_encode($password));
    $write("MAIL FROM: <{$username}>");
    $write("RCPT TO: <{$to}>");
    $write("DATA");

    $headers = [
        "MIME-Version: 1.0",
        "From: =?UTF-8?B?" . base64_encode($fromName) . "?= <{$from}>",
        "To: <{$to}>",
        "Reply-To: {$replyTo}",
        "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=",
        "Content-Type: text/html; charset=UTF-8",
        "Content-Transfer-Encoding: base64",
        "X-Mailer: LumaroStudioMailer/1.0",
    ];

    $emailData = implode("\r\n", $headers) . "\r\n\r\n" . chunk_split(base64_encode($htmlBody)) . "\r\n.";
    $result = $write($emailData);
    $write("QUIT");
    fclose($socket);

    return str_starts_with($result, '250');
}

// Build attached product preview if selected
$productHtml = '';
if (is_array($product) && !empty($product['name'])) {
    $prodName = htmlspecialchars($product['name']);
    $prodCat = htmlspecialchars($product['category'] ?? '');
    $prodSku = htmlspecialchars($product['sku'] ?? '');
    $prodImg = htmlspecialchars($product['imageUrl'] ?? '');

    $productHtml = "
    <div style='margin: 20px 0; padding: 16px; background: #fafaf9; border: 1px solid #d6d3d1; border-radius: 12px;'>
      <span style='display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #b45309; letter-spacing: 0.08em; margin-bottom: 10px;'>
        Attached Furniture Piece of Interest
      </span>
      <table style='width: 100%; border-collapse: collapse;'>
        <tr>
          " . (!empty($prodImg) ? "<td style='width: 72px; vertical-align: top; padding-right: 14px;'><img src='{$prodImg}' alt='{$prodName}' style='width: 72px; height: 72px; object-fit: cover; border-radius: 8px; border: 1px solid #d6d3d1; display: block;' /></td>" : "") . "
          <td style='vertical-align: middle;'>
            <div style='font-size: 15px; font-weight: 700; color: #1c1917;'>{$prodName}</div>
            " . (!empty($prodCat) ? "<div style='font-size: 12px; color: #78716c; margin-top: 2px;'>Category: {$prodCat}</div>" : "") . "
            " . (!empty($prodSku) ? "<div style='font-size: 11px; color: #a8a29e; font-family: monospace; margin-top: 2px;'>SKU: {$prodSku}</div>" : "") . "
          </td>
        </tr>
      </table>
    </div>";
}

$safeName = htmlspecialchars($name);
$safeEmail = htmlspecialchars($email);
$safePhone = htmlspecialchars($phone);
$safeSubject = htmlspecialchars($subject);
$safeMessage = nl2br(htmlspecialchars($message));

// 1. Studio Lead Email Template
$studioHtml = "
<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
  </style>
</head>
<body style='margin: 0; padding: 32px 12px; background-color: #f5f5f4; font-family: \"Plus Jakarta Sans\", system-ui, -apple-system, sans-serif;'>
  <div style='max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #d6d3d1; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(28, 25, 23, 0.08);'>
    
    <div style='background: linear-gradient(135deg, #1c1917 0%, #44403c 50%, #57534e 100%); color: #ffffff; padding: 30px 28px; text-align: center; border-bottom: 2px solid #b45309;'>
      <img 
        src='https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/lumora/LUMORA-LOGO-removebg-preview.png' 
        alt='Lumaro Logo' 
        style='height: 48px; width: auto; margin: 0 auto 10px; display: block; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));'
      />
      <h2 style='margin: 0; font-size: 18px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase;'>
        New Customer Lead
      </h2>
      <p style='margin: 4px 0 0; font-size: 11px; color: #d6d3d1; letter-spacing: 0.08em; text-transform: uppercase;'>
        Lumaro Furniture Studio Website
      </p>
    </div>

    <div style='padding: 28px 24px;'>
      <div style='margin-bottom: 16px;'>
        <span style='display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #78716c; letter-spacing: 0.06em; margin-bottom: 4px;'>Customer Name</span>
        <span style='font-size: 15px; color: #1c1917; font-weight: 700;'>{$safeName}</span>
      </div>
      <div style='margin-bottom: 16px;'>
        <span style='display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #78716c; letter-spacing: 0.06em; margin-bottom: 4px;'>Email Address</span>
        <a href='mailto:{$safeEmail}' style='font-size: 15px; color: #b45309; text-decoration: none; font-weight: 600;'>{$safeEmail}</a>
      </div>
      " . (!empty($safePhone) ? "
      <div style='margin-bottom: 16px;'>
        <span style='display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #78716c; letter-spacing: 0.06em; margin-bottom: 4px;'>Phone Number</span>
        <span style='font-size: 15px; color: #1c1917; font-weight: 600;'>{$safePhone}</span>
      </div>" : "") . "

      {$productHtml}

      <div style='margin-bottom: 16px;'>
        <span style='display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #78716c; letter-spacing: 0.06em; margin-bottom: 4px;'>Subject</span>
        <span style='font-size: 15px; color: #1c1917; font-weight: 700;'>{$safeSubject}</span>
      </div>
      <div style='margin-bottom: 16px;'>
        <span style='display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #78716c; letter-spacing: 0.06em; margin-bottom: 6px;'>Message</span>
        <div style='background-color: #f5f5f4; border-left: 4px solid #78716c; border-radius: 6px; padding: 14px 16px; font-size: 13px; color: #44403c; line-height: 1.6; white-space: pre-wrap;'>{$safeMessage}</div>
      </div>
    </div>
    <div style='padding: 14px 24px; background-color: #f5f5f4; font-size: 11px; color: #78716c; border-top: 1px solid #d6d3d1; text-align: center;'>
      Replying to this email will reply directly to <strong>{$safeEmail}</strong>.
    </div>
  </div>
</body>
</html>";

// 2. Customer Welcome Receipt Template
$customerHtml = "
<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
  <title>Lumaro Furniture Studio</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Great+Vibes&display=swap');
  </style>
</head>
<body style='margin: 0; padding: 36px 12px; background-color: #f5f5f4; font-family: \"Plus Jakarta Sans\", system-ui, -apple-system, sans-serif; color: #1c1917;'>
  <div style='max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #ffffff 0%, #fafaf9 100%); border: 1px solid #d6d3d1; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(28, 25, 23, 0.08);'>
    
    <div style='background: linear-gradient(135deg, #1c1917 0%, #44403c 50%, #57534e 100%); color: #ffffff; padding: 36px 28px; text-align: center; border-bottom: 2px solid #b45309;'>
      <img 
        src='https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/lumora/LUMORA-LOGO-removebg-preview.png' 
        alt='Lumaro Logo' 
        style='height: 52px; width: auto; margin: 0 auto 12px; display: block; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5));'
      />
      <h1 style='margin: 0; font-size: 19px; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: #ffffff; line-height: 1.3;'>
        Lumaro Furniture Studio
      </h1>
      <p style='margin: 6px 0 0; font-family: \"Great Vibes\", cursive, serif; font-size: 19px; color: #d6d3d1; letter-spacing: 0.04em;'>
        Handcrafted Hardwood & Architectural Furniture
      </p>
    </div>

    <div style='padding: 34px 28px;'>
      <h2 style='font-size: 18px; font-weight: 700; color: #1c1917; margin: 0 0 16px; letter-spacing: -0.01em;'>
        Dear {$safeName},
      </h2>
      
      <p style='font-size: 14px; color: #44403c; line-height: 1.7; margin: 0 0 14px;'>
        Thank you for connecting with <strong style='color: #1c1917;'>Lumaro Furniture Studio</strong>! We are thrilled to receive your message.
      </p>

      <p style='font-size: 14px; color: #44403c; line-height: 1.7; margin: 0 0 24px;'>
        Our artisan studio team is currently reviewing your details. We respond to all inquiries within <strong style='color: #1c1917; background-color: #f5f5f4; padding: 2px 6px; border-radius: 4px; border: 1px solid #e7e5e4;'>24 business hours</strong> with answers to your questions, timber recommendations, and delivery details.
      </p>

      {$productHtml}

      <div style='margin: 0 0 24px;'>
        <div style='font-size: 11px; font-weight: 800; text-transform: uppercase; color: #78716c; letter-spacing: 0.08em; margin-bottom: 8px;'>
          Summary of Your Message
        </div>
        <div style='background-color: #f5f5f4; border: 1px solid #e7e5e4; border-left: 4px solid #78716c; border-radius: 8px; padding: 16px 18px;'>
          <p style='margin: 0 0 8px; font-size: 13px; font-weight: 700; color: #1c1917;'>
            Subject: <span style='font-weight: 600; color: #44403c;'>{$safeSubject}</span>
          </p>
          <div style='font-size: 13px; color: #44403c; line-height: 1.65; white-space: pre-wrap;'>{$safeMessage}</div>
        </div>
      </div>

      <div style='background: #ffffff; border: 1px solid #e7e5e4; border-radius: 12px; padding: 18px 20px; margin: 0 0 24px;'>
        <table role='presentation' border='0' cellpadding='0' cellspacing='0' style='width: 100%;'>
          <tr>
            <td style='padding-bottom: 8px; font-size: 12px; color: #44403c; line-height: 1.5;'>
              <strong style='color: #1c1917;'>Studio Operating Hours:</strong><br />
              Monday – Friday: 08:00 – 17:00 &nbsp;|&nbsp; Saturday: 09:00 – 13:00
            </td>
          </tr>
          <tr>
            <td style='padding-bottom: 8px; font-size: 12px; color: #44403c; line-height: 1.5;'>
              <strong style='color: #1c1917;'>Direct Studio Mailbox:</strong><br />
              <a href='mailto:enquiries@lumarofurniture.co.za' style='color: #b45309; text-decoration: none; font-weight: 600;'>enquiries@lumarofurniture.co.za</a>
            </td>
          </tr>
          <tr>
            <td style='font-size: 12px; color: #78716c; line-height: 1.5;'>
              <strong style='color: #1c1917;'>Nationwide Logistics:</strong><br />
              Blanket-wrapped white-glove delivery across all 9 provinces in South Africa.
            </td>
          </tr>
        </table>
      </div>

      <p style='font-size: 13px; color: #78716c; line-height: 1.6; margin: 0 0 24px;'>
        If you have additional dimensions, room photos, or architectural sketches, you can simply reply directly to this email.
      </p>

      <div style='margin-top: 28px; padding-top: 20px; border-top: 1px solid #e7e5e4;'>
        <p style='margin: 0; font-family: \"Great Vibes\", cursive, serif; font-size: 26px; color: #78716c; line-height: 1.2;'>
          Warmest regards,
        </p>
        <p style='margin: 4px 0 0; font-size: 14px; font-weight: 700; color: #1c1917; letter-spacing: 0.02em;'>
          The Lumaro Furniture Studio Team
        </p>
      </div>
    </div>

    <div style='background-color: #f5f5f4; border-top: 1px solid #d6d3d1; padding: 18px 24px; text-align: center; font-size: 11px; color: #a8a29e; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;'>
      &copy; Lumaro Furniture Studio &bull; Handcrafted in South Africa
    </div>
  </div>
</body>
</html>";

// Send Studio Notification
$sent = sendSmtpEmail(
    $smtpHost,
    $smtpPort,
    $smtpUser,
    $smtpPass,
    $smtpUser,
    "Lumaro Website Lead",
    $studioRecipient,
    "\"{$name}\" <{$email}>",
    "[Website Lead] {$subject}",
    $studioHtml
);

// Fallback to PHP native mail() if socket is restricted
if (!$sent) {
    $headers = "MIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\nFrom: {$smtpUser}\r\nReply-To: {$email}";
    @mail($studioRecipient, "[Website Lead] {$subject}", $studioHtml, $headers);
}

// Send Customer Confirmation Receipt
@sendSmtpEmail(
    $smtpHost,
    $smtpPort,
    $smtpUser,
    $smtpPass,
    $smtpUser,
    "Lumaro Furniture Studio",
    $email,
    $smtpUser,
    "Thank you for contacting Lumaro Furniture Studio",
    $customerHtml
);

echo json_encode([
    'success' => true,
    'message' => 'Your inquiry has been received. A confirmation has been sent to your email.'
]);
