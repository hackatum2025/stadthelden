import Image from "next/image";

export const HeroSection = () => {
    return (
        <div className="flex flex-col mb-8">
            <h1 className="text-8xl font-bold text-white tracking-tight">
                STADTHELDEN
            </h1>

            {/* Subtitle and cooperation info on the same line */}
            <div className="flex items-center justify-between w-full">
                {/* BE A CITY HERO - left-aligned */}
                <span className="text-3xl text-white/80">BE A CITY HERO</span>

                {/* In cooperation with TUM - right-aligned */}
                <div className="flex items-start gap-2">
                    <span className="text-sm text-white/60">in Zusammenarbeit mit</span>
                    <Image
                        src="/getThumb.gif"
                        alt="TUM Logo"
                        width={60}
                        height={35}
                        priority
                    />
                </div>
            </div>
        </div>
    );
};


