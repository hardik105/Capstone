import React from "react";
import { FaGithub, FaXTwitter, FaLinkedin, FaInstagram } from "react-icons/fa6";

const Footer: React.FC = () => (
  <footer className="bg-black border-t border-[#232323] pt-12 pb-6 px-4 mt-20">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between gap-12">
      {/* Logo + About */}
      <div className="flex-1 min-w-[200px]">
        <div className="flex items-center mb-4">
          <span className="text-white font-bold text-lg tracking-wide">
            DotLineage
          </span>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          DotLineage. One dot. Infinite clarity.{" "}
        </p>
        <div className="flex space-x-4 mt-2">
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <FaGithub
              className="text-gray-400 hover:text-white transition"
              size={22}
            />
          </a>
          <a
            href="https://x.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X (Twitter)"
          >
            <FaXTwitter
              className="text-gray-400 hover:text-white transition"
              size={22}
            />
          </a>
          <a
            href="https://linkedin.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <FaLinkedin
              className="text-gray-400 hover:text-white transition"
              size={22}
            />
          </a>
          <a
            href="https://instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <FaInstagram
              className="text-gray-400 hover:text-white transition"
              size={22}
            />
          </a>
        </div>
      </div>

      {/* Footer Links */}
      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
        <div>
          <h4 className="text-white font-semibold mb-3">Resources</h4>
          <ul className="space-y-2">
            <li>
              <a
                href="/about"
                className="text-gray-400 hover:text-white transition"
              >
                About
              </a>
            </li>
            <li>
              <a
                href="/features"
                className="text-gray-400 hover:text-white transition"
              >
                Features
              </a>
            </li>
            <li>
              <a
                href="/pricing"
                className="text-gray-400 hover:text-white transition"
              >
                Pricing
              </a>
            </li>
            <li>
              <a
                href="/faq"
                className="text-gray-400 hover:text-white transition"
              >
                FAQ
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Community</h4>
          <ul className="space-y-2">
            <li>
              <a
                href="/blog"
                className="text-gray-400 hover:text-white transition"
              >
                Blog
              </a>
            </li>
            <li>
              <a
                href="/forum"
                className="text-gray-400 hover:text-white transition"
              >
                Forum
              </a>
            </li>
            <li>
              <a
                href="/events"
                className="text-gray-400 hover:text-white transition"
              >
                Events
              </a>
            </li>
            <li>
              <a
                href="/discord"
                className="text-gray-400 hover:text-white transition"
              >
                Discord
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Contact</h4>
          <ul className="space-y-2">
            <li>
              <a
                href="mailto:support@dotlineage.ai"
                className="text-gray-400 hover:text-white transition"
              >
                support@dotlineage.ai
              </a>
            </li>
            <li>
              <a
                href="/contact"
                className="text-gray-400 hover:text-white transition"
              >
                Contact Form
              </a>
            </li>
            <li>
              <a
                href="/privacy"
                className="text-gray-400 hover:text-white transition"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                href="/terms"
                className="text-gray-400 hover:text-white transition"
              >
                Terms of Service
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    {/* Copyright */}
    <div className="border-t border-[#232323] mt-10 pt-6 text-center text-gray-500 text-xs">
      &copy; {new Date().getFullYear()} DotLineage. All rights reserved.
    </div>
  </footer>
);

export default Footer;
