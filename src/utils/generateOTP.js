import otpGenerator from "otp-generator";

const generateOTPFunction = async () => {
    const OTPCode = await otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
    return OTPCode;
}

export default generateOTPFunction ;