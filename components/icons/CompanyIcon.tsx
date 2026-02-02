import Image from "next/image";

export default function Icon() {
  return (
    <div className="flex items-center justify-center w-16 h-16">
      <Image
        src="/assets/company_bgremoved.png"
        alt="Company"
        width={64}
        height={64}
        priority
        className="w-16 h-16 object-contain"
      />
    </div>
  );
}
