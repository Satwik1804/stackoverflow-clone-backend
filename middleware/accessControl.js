import useragent from 'useragent';
import dotenv from "dotenv";

dotenv.config()

const accessControl = (req, res, next) => {
    const userAgentString = req.headers['user-agent'];
    const agent = useragent.parse(userAgentString);
    const isGoogleChrome = userAgentString.includes('Chrome');
    const isMicrosoftBrowser = agent.family === 'IE' || agent.family === 'Edge';
    const isMobileDevice = agent.device.family === 'iPhone' || agent.device.family === 'Android';

    const isOTPValidated = req.headers['x-otp-validated'] === process.env.HEADER;
  
    if (isGoogleChrome) {
      if (isOTPValidated) {
        return next(); 
      } else {
        return res.status(401).json({ message: "OTP authentication required for Google Chrome users.", fromAccessControl: true });
      }
    } else if (isMicrosoftBrowser) {
      req.browserType = 'Microsoft';
      return next();
    } else if (isMobileDevice) {
      const currentHour = new Date().getHours();
      if (currentHour < 10 || currentHour > 13) {
        return res.status(403).json({ message: "Access restricted for mobile devices outside 10 AM to 1 PM.", fromAccessControl: true });
      }
      req.browserType = 'Mobile';
      return next();
    } else {
      req.browserType = 'Other';
      return next(); 
    }
  };
  
export default accessControl;