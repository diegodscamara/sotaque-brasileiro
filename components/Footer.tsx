import Image from "next/image";
import Link from "next/link";
import config from "@/config";
import logo from "@/app/icon.png";

// Add the Footer to the bottom of your landing page and more.
// The support link is connected to the config.js file. If there's no config.resend.supportEmail, the link won't be displayed.

const Footer = () => {
  return (
    <footer id="footer" className="relative mx-auto px-4 py-16 max-w-7xl container">
      <div className="flex md:flex-row flex-col flex-wrap md:flex-nowrap lg:items-start">
        <div className="flex-shrink-0 mx-auto md:mx-0 w-64 text-center md:text-left">
          <Link
            href="/#"
            aria-current="page"
            className="flex justify-center md:justify-start items-center gap-2"
          >
            <Image
              src={logo}
              alt={`${config.appName} logo`}
              priority={true}
              className="w-6 h-6"
              width={24}
              height={24}
            />
            <strong className="font-extrabold text-base md:text-lg tracking-tight">
              {config.appName}
            </strong>
          </Link>

          <p className="mt-3 text-base-content/80 text-sm">
            {config.appDescription}
          </p>
          <p className="mt-3 text-base-content/60 text-sm">
            Copyright © {new Date().getFullYear()} - All rights reserved
          </p>
        </div>
        <div className="flex flex-wrap flex-grow justify-center mt-10 md:mt-0 -mb-10 text-center">
          <div className="px-4 w-full md:w-1/2 lg:w-1/3">
            <div className="mb-3 font-semibold text-base-content text-sm md:text-left tracking-widest footer-title">
              LINKS
            </div>

            <div className="flex flex-col justify-center items-center md:items-start gap-2 mb-10 text-sm">
              {config.resend.supportEmail && (
                <a
                  href={`mailto:${config.resend.supportEmail}`}
                  target="_blank"
                  className="link link-hover"
                  aria-label="Contact Support"
                >
                  Support
                </a>
              )}
              <Link href="/#pricing" className="link link-hover">
                Pricing
              </Link>
              <Link href="/blog" className="link link-hover">
                Blog
              </Link>
              <a href="/#" target="_blank" className="link link-hover">
                Affiliates
              </a>
            </div>
          </div>

          <div className="px-4 w-full md:w-1/2 lg:w-1/3">
            <div className="mb-3 font-semibold text-base-content text-sm md:text-left tracking-widest footer-title">
              LEGAL
            </div>

            <div className="flex flex-col justify-center items-center md:items-start gap-2 mb-10 text-sm">
              <Link href="/tos" className="link link-hover">
                Terms of services
              </Link>
              <Link href="/privacy-policy" className="link link-hover">
                Privacy policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
