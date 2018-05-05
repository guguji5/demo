import hmacSHA256 from 'crypto-js/hmac-sha256';

let API_KEY = "2c4b3a21eb164eac9fc3fa9eca4f7b8a";
let API_SECRET = "e3e22565f93045308c65104aaff93688";

let createTimestamp = function () {
    return parseInt(new Date().getTime() / 1000) + '';
};
let nonce = 1234567890123456789012;

let stamp = createTimestamp();

export function Auth(){
    let ret = [nonce,stamp,API_KEY];

    let string = ret.sort().join("");

    let signature = hmacSHA256(string, API_SECRET);
    let result = "key=" + API_KEY
        +",timestamp=" + stamp
        +",nonce=" + nonce
        +",signature=" + signature;
    return result;
}