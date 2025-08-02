import { sendEmail } from "./emailService.js";

const sendEmailFun=async({sendTo, subject, text, html})=>{
  console.log(sendTo)
    const result = await sendEmail(sendTo, subject, text, html);
    if (result.success) {
        return true;
      //res.status(200).json({ message: 'Email sent successfully', messageId: result.messageId });
    } else {
        return false;
     // res.status(500).json({ message: 'Failed to send email', error: result.error });
    }
}


export default sendEmailFun;