import { NavLink } from "react-router-dom";

function Footer() {
  const currentYear = new Date().getFullYear();

  const links = [
    { name: "Terms of Service", url: "#Terms" },
    { name: "Privacy Policy", url: "#Privacy" },
    { name: "Contact Us", url: "#Contact" },
    { name: "About Us", url: "#About" },
    { name: "Help", url: "#Help" },
    { name: "FAQs", url: "#FAQs" },
  ];

  return (
    <section>
      <footer className="footer bg-gray-900 text-white p-4 text-center w-100 line-height-2">
        <p className="text-sm">
          &copy; {currentYear} Smart Budget. All rights reserved.
        </p>
        <div>
          {links.map((link, index) => (
            <NavLink key={index} to={link.url} className="text-sm">
              | {link.name} |
            </NavLink>
          ))}
        </div>
      </footer>
    </section>
  );
}

export default Footer;
