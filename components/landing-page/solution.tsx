import { BellIcon, Share2Icon } from "lucide-react";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { CalendarIcon, FileTextIcon } from "@radix-ui/react-icons";

export const Solution = () => {
    const features = [
        {
            Icon: FileTextIcon,
            name: "Save your files",
            description: "We automatically save your files as you type.",
            className: "col-span-3 lg:col-span-1",
            background: (
                <div>
                    <p>Save your files</p>
                    <p>We automatically save your files as you type.</p>
                </div>
            ),
        },
        {
            Icon: BellIcon,
            name: "Notifications",
            description: "Get notified when something happens.",
            className: "col-span-3 lg:col-span-2",
            background: (
                <div>
                    <p>Get notified when something happens.</p>
                </div>
            ),
        },
        {
            Icon: Share2Icon,
            name: "Integrations",
            description: "Supports 100+ integrations and counting.",
            className: "col-span-3 lg:col-span-2",
            background: (
                <div>
                    <p>Supports 100+ integrations and counting.</p>
                </div>
            ),
        },
        {
            Icon: CalendarIcon,
            name: "Calendar",
            description: "Use the calendar to filter your files by date.",
            className: "col-span-3 lg:col-span-1",
            background: (
                <div>
                    <p>Use the calendar to filter your files by date.</p>
                </div>
            ),
        },
    ];

    return (
        <section className="container">
            <div>
                <div className="relative flex flex-col justify-center items-center gap-16 mx-auto px-4 py-16 max-w-7xl container">
                    <div className="space-y-4 mx-auto pb-6 text-center">
                        <h2 className="font-medium font-mono text-primary text-sm uppercase tracking-wider">Solution</h2>
                        <h3 className="mx-auto mt-4 max-w-xs sm:max-w-none font-semibold text-3xl sm:text-4xl md:text-5xl">Empower Your Business with AI Workflows</h3>
                        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 leading-8">Generic AI tools won&apos;t suffice. Our platform is purpose-built to provide exceptional AI-driven solutions for your unique business needs.</p>
                    </div>
                    <BentoGrid>
                        {features.map((feature, idx) => (
                            <BentoCard key={idx} {...feature} />
                        ))}
                    </BentoGrid>
                </div>
            </div>
        </section>
    )
}