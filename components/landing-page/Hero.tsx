import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import TestimonialsAvatars from "./TestimonialsAvatars";

const Hero = () => {
  return (
    <section id="hero" className="relative flex lg:flex-row flex-col justify-center items-center gap-16 lg:gap-20 mx-auto px-4 py-16 max-w-7xl container">
      <div className="flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
        <h1 className="my-6 font-extrabold text-4xl lg:text-6xl tracking-tight">
          Transforme o futuro do seu filho em dias, não semanas
        </h1>
        <p className="mb-8 max-w-xl text-muted-foreground lg:text-xl">
          O boilerplate NextJS com tudo que você precisa para construir sua escola,
          ferramentas de aprendizado, ou qualquer outro aplicativo web. Da ideia à produção em 5 minutos.
        </p>

        <TestimonialsAvatars priority={true} />

        <div className="flex lg:flex-row flex-col justify-center items-center gap-4">
          <Button variant="default" effect="gooeyLeft">
            Sign up
          </Button>
          <Button variant="outline" effect="gooeyLeft">
            Get started
            <ArrowRightIcon className="size-4" />
          </Button>
        </div>

      </div>
      <div className="lg:w-full">
        <Image
          src="https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3540&q=80"
          alt="Demonstração do Produto"
          className="rounded-md w-full max-h-[600px] lg:max-h-[800px] object-cover"
          priority={true}
          width={500}
          height={500}
        />
      </div>
    </section>
  );
};

export default Hero;
