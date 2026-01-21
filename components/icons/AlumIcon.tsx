import Image from "next/image";

export default function Icon() {
  return (
    <div className="flex items-center cursor-pointer group hover:opacity-90 transition-opacity duration-200">
      <Image
        src="/assets/alumni_bgremoved.png"
        alt="Alumni"
        width={60}
        height={60}
        priority
        className="h-16 w-auto"
      />
    </div>
  );
}
