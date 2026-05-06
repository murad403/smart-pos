import Image from "next/image";
import splashLogo from "@/assets/logo/logo.png";

const Splash = () => {
    return (
        <section className="splash-surface relative flex min-h-screen items-center justify-center overflow-hidden">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
                <div className="splash-wave-primary" />
                <div className="splash-wave-secondary" />
            </div>

            <div className="splash-logo-shell relative z-10">
                <Image
                    src={splashLogo}
                    alt="Best Way Special logo"
                    width={260}
                    height={240}
                    priority
                    sizes="260px"
                    className="h-full w-full object-contain"
                />
            </div>
        </section>
    );
};

export default Splash;