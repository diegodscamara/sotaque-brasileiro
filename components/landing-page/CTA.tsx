import { Button } from "@/components/ui/button";
import Link from "next/link";
import config from "@/config";

const CTA = () => {
  return (
    <section className="bg-secondary py-8 w-full">
      <div className="flex flex-col justify-center items-center gap-6 mx-auto py-24 max-w-3xl text-center container">
        <p className="inline-block mb-4 font-semibold text-primary">Ready to get started?</p>
        <h2 className="font-bold text-3xl text-center md:text-5xl">
          Boost your app, launch, earn
        </h2>
        <p className="text-lg">
          Don&apos;t waste time integrating APIs or designing a pricing
          section...
        </p>

        <Button variant="default" effect="shine" className="w-fit" asChild>
          <Link href="/#pricing">
            Get {config.appName}
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default CTA;
