import Image from "next/image";

export default function CorporateOBIcon() {
  return (
    <div className="flex items-center cursor-pointer group hover:opacity-90 transition-opacity duration-200">
      <Image
        src="/assets/corporateOB.png"
        alt="Corporate OB"
        width={60}
        height={60}
        priority
        className="h-16 w-auto"
      />
    </div>
  );
}
