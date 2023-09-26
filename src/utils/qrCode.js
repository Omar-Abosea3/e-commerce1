import  qrCode  from "qrcode";

export const qrCodeFunction = ({data = ''} = {}) => {
    const qrCodeResult = qrCode.toDataURL(JSON.stringify(data) , {errorCorrectionLevel:'H'});
    return qrCodeResult;
}