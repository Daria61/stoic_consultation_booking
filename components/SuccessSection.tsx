import { Calendar, MapPin, Link } from "lucide-react";
import Image from "next/image";

export const SuccessSection = ({ date }: { date: string }) => {
  const dateSplitted = date.split(" ");
  console.log(dateSplitted);

  return (
    <div>
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 items-center">
          <Calendar width={30} />
          <div>
            <p>{dateSplitted[0]}</p>
            <p className="text-gray-600 text-[12px]">{dateSplitted[2]}</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <MapPin width={30} />
          <div>
            <p>Stoic Education Office</p>
            <a
              href="https://www.google.com/maps/place/Stoic+Education+Consulting+Firm/@47.9172052,106.9069526,743m/data=!3m2!1e3!4b1!4m6!3m5!1s0x5d96935a9986ab71:0xadd672bf4954577!8m2!3d47.9172016!4d106.9095275!16s%2Fg%2F11xp4903pk!5m1!1e1?entry=ttu&g_ep=EgoyMDI2MDEyNy4wIKXMDSoASAFQAw%3D%3D"
              target="_blank"
              className="text-gray-600 text-[12px] flex gap-2 items-center"
            >
              Galleria Ulaanbaatar - Perla <Link width={12} />
            </a>
          </div>
        </div>
      </div>
      <div>
        <p className="font-bold text-xl text-center my-5">
          ✅ Successfully booked
        </p>

        <p>
          The consultation booked at {date}. Please check your email for the
          further information.
        </p>
        <div className="flex justify-center">
          <Image
            src="/hand.png"
            alt="hand_img"
            width={400}
            height={200}
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
};
