const { Resend } = require('resend');

// Khởi tạo Resend với API Key từ file .env
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Gửi OTP Email qua Resend
 */
const sendEmail = async (to, subject, text) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'MyStore <onboarding@resend.dev>', 
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #7c3aed;">Mã xác thực đơn hàng</h2>
          <p>Chào bạn,</p>
          <p>Mã OTP của bạn là: <strong style="font-size: 24px; color: #7c3aed;">${text.match(/\d+/)[0]}</strong></p>
          <p>Mã này sẽ hết hạn sau 5 phút.</p>
          <hr />
          <p style="font-size: 12px; color: #888;">Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      throw error;
    }

    console.log("Email sent successfully via Resend:", data.id);
    return data;
  } catch (err) {
    console.error("Fail to send email:", err);
    throw err;
  }
};

module.exports = { sendEmail };