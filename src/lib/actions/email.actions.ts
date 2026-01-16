
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
        sender: "tharik@leprofile.com", // Using the verified sender address
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

export async function sendPasswordResetEmail(to: string, token: string) {
    const resetLink = `http://localhost:9002/reset-password?token=${token}`;

    const htmlBody = `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <a href="${resetLink}" target="_blank">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
    `;

    const textBody = `
        Password Reset Request\n
        You requested a password reset. Copy and paste the following link into your browser to set a new password:\n
        ${resetLink}\n
        This link will expire in 1 hour.\n
        If you did not request a password reset, please ignore this email.
    `;

    await sendEmail({
        to: [to],
        subject: 'Your CyberGuardian Password Reset Link',
        html_body: htmlBody,
        text_body: textBody,
    });
}
