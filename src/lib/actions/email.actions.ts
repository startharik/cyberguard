
'use server';

interface EmailPayload {
    to: string[];
    subject: string;
    html_body: string;
    text_body: string;
}

export async function sendEmail(payload: EmailPayload) {
    const apiKey = process.env.SMTP2GO_API_KEY;
    if (!apiKey) {
        console.error('SMTP2GO_API_KEY is not set.');
        throw new Error('Email service is not configured.');
    }

    const apiPayload = {
        api_key: apiKey,
        sender: "CyberGuardian <tharik@leprofile.com>",
        ...payload,
    };

    try {
        const response = await fetch('https://api.smtp2go.com/v3/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiPayload),
        });

        const result = await response.json();

        if (!response.ok || result.error) {
            console.error('SMTP2GO Error:', result.error_message || 'Unknown error');
            throw new Error(result.error_message || 'Failed to send email.');
        }

        console.log('Email sent successfully:', result);
        return result;
    } catch (error) {
        console.error('Failed to send email via SMTP2GO:', error);
        throw new Error('An error occurred while trying to send the email.');
    }
}

export async function sendPasswordResetOtp(to: string, otp: string) {
    const htmlBody = `
        <h2>Password Reset Request</h2>
        <p>Your password reset code is:</p>
        <h3 style="font-size: 24px; letter-spacing: 2px; font-family: monospace;">${otp}</h3>
        <p>This code will expire in 1 hour.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
    `;

    const textBody = `
        Password Reset Request\n
        Your password reset code is: ${otp}\n
        This code will expire in 1 hour.\n
        If you did not request a password reset, please ignore this email.
    `;

    await sendEmail({
        to: [to],
        subject: 'Your CyberGuardian Password Reset Code',
        html_body: htmlBody,
        text_body: textBody,
    });
}
