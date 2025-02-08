import Image from "next/image";
import { StaticImageData } from "next/image";
import config from "@/config";

// The list of your testimonials. It needs 3 items to fill the row.
const list: {
  username?: string;
  name: string;
  text: string;
  img?: string | StaticImageData;
}[] = [
    {
      // Optional, use for social media like Twitter. Does not link anywhere but cool to display
      username: "marclou",
      // REQUIRED
      name: "Marc Lou",
      // REQUIRED
      text: "Really easy to use. The tutorials are really useful and explains how everything works. Hope to ship my next project really fast!",
      // Optional, a statically imported image (usually from your public folder—recommended) or a link to the person's avatar. Shows a fallback letter if not provided
      img: "https://pbs.twimg.com/profile_images/1514863683574599681/9k7PqDTA_400x400.jpg",
    },
    {
      username: "the_mcnaveen",
      name: "Naveen",
      text: "Setting up everything from the ground up is a really hard, and time consuming process. What you pay for will save your time for sure.",
    },
    {
      username: "wahab",
      name: "Wahab Shaikh",
      text: "Easily saves 15+ hrs for me setting up trivial stuff. Now, I can directly focus on shipping features rather than hours of setting up the same technologies from scratch. Feels like a super power! :D",
    },
  ];

// A single testimonial, to be rendered in  a list
const Testimonial = ({ i }: { i: number }) => {
  const testimonial = list[i];

  if (!testimonial) return null;

  return (
    <li key={i}>
      <figure className="relative flex flex-col bg-base-200 p-6 md:p-10 rounded-2xl max-w-lg h-full max-md:text-sm">
        <blockquote className="relative flex-1">
          <p className="text-base-content/80 leading-relaxed">
            {testimonial.text}
          </p>
        </blockquote>
        <figcaption className="relative flex justify-start items-center gap-4 md:gap-8 mt-4 md:mt-8 pt-4 md:pt-8 border-t border-base-content/5">
          <div className="flex justify-between items-center gap-2 w-full">
            <div>
              <div className="md:mb-0.5 font-medium text-base-content">
                {testimonial.name}
              </div>
              {testimonial.username && (
                <div className="mt-0.5 text-base-content/80 text-sm">
                  @{testimonial.username}
                </div>
              )}
            </div>

            <div className="bg-base-300 rounded-full overflow-hidden shrink-0">
              {testimonial.img ? (
                <Image
                  className="rounded-full w-10 md:w-12 h-10 md:h-12 object-cover"
                  src={list[i].img}
                  alt={`${list[i].name}'s testimonial for ${config.appName}`}
                  width={48}
                  height={48}
                />
              ) : (
                <span className="flex justify-center items-center bg-base-300 rounded-full w-10 md:w-12 h-10 md:h-12 font-medium text-lg">
                  {testimonial.name.charAt(0)}
                </span>
              )}
            </div>
          </div>
        </figcaption>
      </figure>
    </li>
  );
};

const Testimonials3 = () => {
  return (
    <section id="testimonials" className="relative mx-auto px-4 py-16 max-w-7xl container">
      <div className="flex flex-col mb-20 w-full text-center">
        <div className="mb-8">
          <h2 className="font-extrabold text-4xl text-base-content sm:text-5xl">
            212 makers are already shipping faster!
          </h2>
        </div>
        <p className="mx-auto lg:w-2/3 text-base text-base-content/80 leading-relaxed">
          Don&apos;t take our word for it. Here&apos;s what they have to say
          about ShipFast.
        </p>
      </div>

      <ul
        role="list"
        className="flex lg:flex-row flex-col items-center lg:items-stretch gap-6 lg:gap-8"
      >
        {[...Array(3)].map((e, i) => (
          <Testimonial key={i} i={i} />
        ))}
      </ul>
    </section>
  );
};

export default Testimonials3;
