import logoImage from "@/assets/logoMosaico.png";

export default function Logo({ className }) {
  return (
    <img src={logoImage} alt="Logo" className={className || "w-20 mb-5"} />
  );
}
