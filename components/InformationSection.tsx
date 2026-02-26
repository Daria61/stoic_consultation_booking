import { Calendar, MapPin, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export const InformationSection = ({
  handleNextStep,
}: {
  handleNextStep: () => void;
}) => {
  return (
    <div>
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 items-center">
          <Calendar width={30} />
          <div>
            <p>Starting from March 1st</p>
            <p className="text-gray-600 text-[12px]">12PM - 18PM</p>
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
      <div className="mt-10">
        <p className="font-semibold mb-3 text-xl">Description</p>
        This one-on-one consultation is designed for students in Grades 9 to 12
        and gap year students, along with their parents, who want clear and
        practical guidance about studying abroad. The session focuses on
        providing accurate, personalized information based on the student’s
        academic background, interests, and long-term plans.
        <br />
        <Image
          src="/sss.png"
          alt="poster"
          width={500}
          height={300}
          // className="object-cover z-2"
        />
        <br />
        You will receive detailed guidance on studying in countries such as the
        United States, Canada, Australia, South Korea, Hungary, and Italy, along
        with other international destinations. We explain admission systems,
        subject requirements, grading structures, tuition fees, scholarships,
        visa processes, and future career pathways connected to each country.
        <br />
        <br />
        For younger students in Grades 9 to 11, the consultation can help with
        subject selection, extracurricular planning, profile building, and
        understanding what universities look for. For Grade 12 and gap year
        students, the focus shifts to application strategy, university
        shortlisting, deadlines, and offer evaluation.
        <br />
        <Image
          src="/socrat.png"
          alt="poster"
          width={500}
          height={300}
          // className="object-cover z-2"
        />
        <br />
        If you have already applied to universities, you can receive structured
        feedback on your application. Your application file can be reviewed and
        graded, with discussion on strengths, weaknesses, and possible
        improvements. We also help you compare offers, decide between
        universities, and consider gap year planning if needed.
        <br />
        <br />
        Parents are encouraged to attend so that academic goals, financial
        planning, and long-term direction are clearly discussed and aligned.
        <Image
          src="/sticker.png"
          alt="poster"
          width={500}
          height={300}
          // className="object-cover z-2"
        />
        The purpose of this consultation is to give students and families
        clarity, realistic options, and a defined plan for university study
        abroad.
        <br />
        <br />1 hour consulting 150,000 MNT
      </div>

      <Button
        onClick={handleNextStep}
        className="w-full bg-blue-500 text-white my-6 py-5"
      >
        Next
      </Button>
    </div>
  );
};
