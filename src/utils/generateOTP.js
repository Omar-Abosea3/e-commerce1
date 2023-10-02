import otp_code_generator from "otp_code_generator";

const generateOTPFunction = async () => {
    const OTPCode = await otp_code_generator.generate("JBSWY3DPEHPK3PXP", { digits: 4, algorithm: "SHA-512", period: 60 });
    return OTPCode;
}

export default generateOTPFunction ;