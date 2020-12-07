const sgMail= require('@sendgrid/mail')


sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendwelcomeemail = (email,name)=>{
    sgMail.send({
        to: email,
        from: 'saisyama31@gmail.com',
        subject: 'thanks for joining in!',
        text : `welcome to the app, ${name}.`
    })

}

const sendcancelationemail=(email,name)=>{
    sgMail.send({
        to: email,
        from: 'saisyama31@gmail.com',
        subject: 'sorry to see u go!',
        text : `goobye, ${name}. i hope to see you back sometime soon.`
    })

}

module.exports = {
    sendwelcomeemail,
    sendcancelationemail

}