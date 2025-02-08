import { Avatar } from "@/components/ui/avatar";
import Image from "next/image";
import Rating from "@/components/ui/rating";

const avatars: {
  alt: string;
  src: string;
}[] = [
    {
      alt: "User",
      // Ideally, load from a statically generated image for better SEO performance (import userImage from "@/public/userImage.png")
      src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3276&q=80",
    },
    {
      alt: "User",
      src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
    },
    {
      alt: "User",
      src: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
    },
    {
      alt: "User",
      src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
    },
    {
      alt: "User",
      src: "https://images.unsplash.com/photo-1488161628813-04466f872be2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3376&q=80",
    },
  ];

const TestimonialsAvatars = ({ priority }: { priority?: boolean }) => {
  return (
    <div className="flex sm:flex-row flex-col items-center gap-4 mb-12 w-fit">
      {/* AVATARS */}
      <div className="inline-flex items-center -space-x-4">
        {avatars.map((image, i) => (
          <Avatar key={i} className="relative flex border rounded-full w-12 h-12 overflow-hidden shrink-0 size-12">
            <Image
              src={image.src}
              alt={image.alt}
              priority={priority}
              className="w-full h-full aspect-square object-cover"
              width={50}
              height={50}
            />
          </Avatar>
        ))}
      </div>

      {/* RATING */}
      <div className="flex flex-col justify-center items-center md:items-start gap-1">
        <div className="flex items-center gap-1">
          <Rating count={5} className="flex items-center gap-1 text-yellow-400" />
          <span className="font-semibold text-base-content">5.0</span>
        </div>
        <div className="text-base text-base-content/80">
          from 200+ reviews
        </div>
      </div>
    </div>
  );
};

export default TestimonialsAvatars;
