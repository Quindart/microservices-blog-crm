"use client";

import Image from "next/image";
import Link from "next/link";
import { animated, useSpring } from "@react-spring/web";
import { motion, type Variants } from "framer-motion";
import { Suspense } from "react";
import { useEffect, useRef, useState } from "react";
import { useScroll, useTransform } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { IconType } from "react-icons";
import {
  FaEnvelope,
  FaFacebookF,
  FaGoogle,
  FaInstagram,
  FaThreads,
  FaYoutube,
} from "react-icons/fa6";

const paradigms = [
  "Thương hiệu thời trang",
  "Nền tảng giáo dục",
  "Bán hàng tại điểm",
  "Tài chính số",
  "Nhà thông minh",
];

const services = [
  {
    number: "01",
    title: "Website",
    text: "Website rõ ràng, có chiều sâu và tạo cảm giác tin cậy ngay từ lần chạm đầu tiên.",
  },
  {
    number: "02",
    title: "Ứng dụng di động",
    text: "Ứng dụng di động tối giản, dễ dùng và được thiết kế quanh hành vi thật của người dùng.",
  },
  {
    number: "03",
    title: "Hệ thống số",
    text: "Hệ thống số linh hoạt cho thương hiệu muốn vận hành nhanh, gọn và nhất quán.",
  },
];

const networkNodes = [
  { name: "Facebook", icon: FaFacebookF, x: "8%", y: "22%", delay: 0 },
  { name: "Instagram", icon: FaInstagram, x: "18%", y: "67%", delay: 0.8 },
  { name: "Threads", icon: FaThreads, x: "34%", y: "11%", delay: 1.6 },
  { name: "Email", icon: FaEnvelope, x: "68%", y: "12%", delay: 0.4 },
  { name: "Google", icon: FaGoogle, x: "86%", y: "28%", delay: 1.2 },
  { name: "YouTube", icon: FaYoutube, x: "84%", y: "68%", delay: 2 },
];

const reveal: Variants = {
  hidden: { opacity: 0, y: 42 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
    >
      {children}
    </motion.div>
  );
}

function TextReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <span className={`block overflow-hidden ${className}`}>
      <motion.span
        className="block"
        initial={{ opacity: 0, y: "110%" }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
}

function ScrollText({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.88", "end 0.28"],
  });
  const y = useTransform(scrollYProgress, [0, 0.4, 1], [28, 0, -5]);
  const opacity = useTransform(scrollYProgress, [0, 0.22, 0.7], [0, 1, 1]);
  const blur = useTransform(scrollYProgress, [0, 0.35], ["blur(8px)", "blur(0px)"]);

  return (
    <motion.span ref={ref} className={`block ${className}`} style={{ y, opacity, filter: blur }}>
      {children}
    </motion.span>
  );
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-0.5 origin-left bg-[#1d65d6]"
      style={{ scaleX: scrollYProgress }}
    />
  );
}

function WaveDivider({
  fill,
  flip = false,
  height = "h-16",
}: {
  fill: string;
  flip?: boolean;
  height?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute bottom-[-1px] left-0 z-10 w-full ${height} ${flip ? "scale-x-[-1]" : ""}`}
      viewBox="0 0 1440 100"
      preserveAspectRatio="none"
      fill={fill}
    >
      <path d="M0 44C180 84 360 84 540 44S900 4 1080 44s270 40 360-4v60H0Z" />
    </svg>
  );
}

const contactSchema = z.object({
  fullName: z.string().trim().min(2, "Vui lòng nhập họ tên."),
  email: z.string().trim().email("Email chưa đúng định dạng."),
  phone: z
    .string()
    .trim()
    .regex(/^(\+84|0)[0-9\s().-]{8,14}$/, "Số điện thoại chưa đúng định dạng."),
});

type ContactValues = z.infer<typeof contactSchema>;

function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { fullName: "", email: "", phone: "" },
  });

  const onSubmit = (values: ContactValues) => {
    const subject = encodeURIComponent(`Liên hệ mới từ ${values.fullName}`);
    const body = encodeURIComponent(
      `Họ tên: ${values.fullName}\nEmail: ${values.email}\nSố điện thoại: ${values.phone}`,
    );

    window.open(`mailto:lmqiuhdev@gmail.com?subject=${subject}&body=${body}`, "_self");
    setSubmitted(true);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-black/70">
          Họ tên
        </label>
        <input
          id="fullName"
          type="text"
          placeholder="Nguyễn Văn A"
          {...register("fullName")}
          className="w-full rounded-2xl border border-black/10 bg-white px-5 py-4 text-sm outline-none transition placeholder:text-black/30 focus:border-[#1d65d6] focus:ring-4 focus:ring-[#1d65d6]/10"
        />
        {errors.fullName && <p className="mt-2 text-xs text-red-600">{errors.fullName.message}</p>}
      </div>
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-black/70">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...register("email")}
          className="w-full rounded-2xl border border-black/10 bg-white px-5 py-4 text-sm outline-none transition placeholder:text-black/30 focus:border-[#1d65d6] focus:ring-4 focus:ring-[#1d65d6]/10"
        />
        {errors.email && <p className="mt-2 text-xs text-red-600">{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="phone" className="mb-2 block text-sm font-medium text-black/70">
          Số điện thoại
        </label>
        <input
          id="phone"
          type="tel"
          placeholder="0814111321"
          {...register("phone")}
          className="w-full rounded-2xl border border-black/10 bg-white px-5 py-4 text-sm outline-none transition placeholder:text-black/30 focus:border-[#1d65d6] focus:ring-4 focus:ring-[#1d65d6]/10"
        />
        {errors.phone && <p className="mt-2 text-xs text-red-600">{errors.phone.message}</p>}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex rounded-full bg-[#171717] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#1d65d6] disabled:cursor-wait disabled:opacity-60"
      >
        {isSubmitting ? "Đang chuẩn bị email..." : "Liên hệ với chúng tôi ↗"}
      </button>
      {submitted && (
        <p className="text-sm text-black/55">
          Email đã được chuẩn bị. Hãy kiểm tra ứng dụng email của bạn để gửi đi.
        </p>
      )}
    </form>
  );
}

function SocialNetwork() {
  return (
    <div className="pointer-events-none absolute inset-0 z-20" aria-label="Các nền tảng kết nối">
      <svg
        className="network-lines absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M12 28 L39 17 L72 18 L89 34 L87 73 L23 73 L12 28" />
        <path d="M39 17 L23 73 M72 18 L87 73 M12 28 L87 73 M23 73 L89 34" />
      </svg>
      {networkNodes.map((node) => {
        const Icon = node.icon as IconType;

        return (
          <motion.div
            key={node.name}
            className="network-node absolute flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-semibold text-white sm:h-14 sm:w-14"
            style={{ left: node.x, top: node.y }}
            animate={{ y: [0, -8, 0], rotate: [-3, 3, -3] }}
            transition={{ duration: 4.5, delay: node.delay, repeat: Infinity, ease: "easeInOut" }}
            aria-label={node.name}
          >
            <Icon aria-hidden="true" />
          </motion.div>
        );
      })}
    </div>
  );
}

function SpringCursor() {
  const [spring, api] = useSpring(() => ({
    left: 0,
    top: 0,
    scale: 1,
    opacity: 0,
    config: { mass: 0.25, tension: 450, friction: 32 },
  }));

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: fine)");

    if (!mediaQuery.matches) return;

    document.body.classList.add("spring-cursor-enabled");

    const handlePointerMove = (event: PointerEvent) => {
      const target = event.target as Element | null;
      const isInteractive = Boolean(
        target?.closest("a, button, input, textarea, select, .network-node"),
      );

      api.start({
        left: event.clientX,
        top: event.clientY,
        opacity: 1,
        scale: isInteractive ? 1.8 : 1,
      });
    };

    const handlePointerLeave = () => api.start({ opacity: 0 });

    window.addEventListener("pointermove", handlePointerMove);
    document.documentElement.addEventListener("mouseleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("mouseleave", handlePointerLeave);
      document.body.classList.remove("spring-cursor-enabled");
    };
  }, [api]);

  return <animated.div aria-hidden="true" className="spring-cursor" style={spring} />;
}

function HomeContent() {
  return (
    <main className="overflow-hidden bg-[#f5f5f2] text-[#171717]">
      <SpringCursor />
      <ScrollProgress />
      <section className="relative mx-auto max-w-7xl px-5 pb-16 pt-16 sm:px-8 lg:px-12 lg:pb-24 lg:pt-24">
        <div className="grid items-end gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div className="relative z-10">
            <motion.p
              className="mb-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#1d65d6]"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className="h-px w-8 bg-[#1d65d6]" /> Le Minh Quang · Nhà sáng lập
            </motion.p>
            <h1 className="max-w-2xl text-5xl font-semibold leading-[0.98] tracking-[-0.075em] sm:text-6xl lg:text-[5.8rem]">
              <TextReveal delay={0.08}>Sản phẩm số,</TextReveal>
              <TextReveal delay={0.18} className="text-[#1d65d6]">
                gần gũi hơn.
              </TextReveal>
            </h1>
            <motion.p
              className="mt-8 max-w-md text-base leading-7 text-black/60 sm:text-lg"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Tôi xây dựng website và ứng dụng di động mang phong cách tối giản, tinh tế — để ý
              tưởng tốt trở nên dễ chạm đến hơn.
            </motion.p>
            <motion.div
              className="mt-9 flex flex-wrap items-center gap-4"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <a
                href="#about"
                className="rounded-full bg-[#171717] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#1d65d6]"
              >
                Khám phá studio ↓
              </a>
              <a
                href="mailto:hello@leminhquang.studio"
                className="text-sm font-medium text-black/60 underline decoration-black/20 underline-offset-8 transition hover:text-[#1d65d6]"
              >
                Bắt đầu một dự án
              </a>
            </motion.div>
          </div>
          <motion.div
            className="relative min-h-[390px] overflow-hidden rounded-[2rem] bg-[#dce9f8] sm:min-h-[500px] lg:min-h-[590px]"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.15 }}
          >
            <Image
              src="/home-intro.png"
              alt="Le Minh Quang giới thiệu một sản phẩm số"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover object-center"
            />
            <div className="absolute bottom-5 left-5 rounded-full bg-white/85 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] backdrop-blur-md">
              Thiết kế · Lập trình · Tận tâm
            </div>
          </motion.div>
        </div>
        <div className="mt-16 flex items-center justify-between border-t border-black/10 pt-5 text-xs uppercase tracking-[0.2em] text-black/40">
          <span>Cuộn để khám phá</span>
          <span>01 / 04</span>
        </div>
      </section>

      <section
        className="relative border-y border-black/10 bg-white pb-16 pt-5"
        aria-label="Các lĩnh vực đã thực hiện"
      >
        <div className="marquee-track flex w-max items-center gap-5">
          {[...paradigms, ...paradigms].map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="flex items-center gap-5 whitespace-nowrap text-sm font-medium uppercase tracking-[0.16em] text-black/55"
            >
              {item}
              <span className="text-[#1d65d6]">✳</span>
            </span>
          ))}
        </div>
        <WaveDivider fill="#f5f5f2" />
      </section>

      <section
        id="about"
        className="relative mx-auto px-5 py-24 pb-40 sm:px-8 lg:px-12 lg:py-36 lg:pb-52"
      >
        <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
          <Reveal>
            <div className="relative overflow-hidden">
              <Image
                src="/hero-banner.png"
                alt="Le Minh Quang làm việc trên một sản phẩm website"
                width={1376}
                height={768}
                className="h-auto w-full object-contain mix-blend-multiply"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            </div>
          </Reveal>
          <Reveal className="lg:pt-8">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.26em] text-[#1d65d6]">
              Về studio
            </p>
            <h2 className="max-w-2xl text-4xl font-semibold leading-[1.05] tracking-[-0.06em] sm:text-6xl">
              <ScrollText>
                Một studio nhỏ cho những ý tưởng có{" "}
                <span className="text-[#1d65d6]">tầm nhìn lớn.</span>
              </ScrollText>
            </h2>
            <p className="mt-7 max-w-xl text-lg leading-8 text-black/60">
              Được sáng lập vào năm 2026 bởi Le Minh Quang, studio cung cấp các giải pháp website và
              ứng dụng di động với ngôn ngữ thị giác tối giản, tinh tế và có chủ đích.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-6 border-t border-black/10 pt-6 text-sm text-black/55">
              <div>
                <strong className="block text-3xl font-semibold tracking-[-0.05em] text-black">
                  2026
                </strong>
                <span className="mt-1 block">Thành lập tại Việt Nam</span>
              </div>
              <div>
                <strong className="block text-3xl font-semibold tracking-[-0.05em] text-black">
                  05+
                </strong>
                <span className="mt-1 block">Lĩnh vực số</span>
              </div>
            </div>
          </Reveal>
        </div>
        <WaveDivider fill="#171717" flip />
      </section>

      <section className="relative bg-[#171717] px-5 py-24 pb-40 text-white sm:px-8 lg:px-12 lg:py-32 lg:pb-52">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mb-16 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.26em] text-[#70a6ff]">
                  Tôi làm gì
                </p>
                <h2 className="max-w-2xl text-4xl font-semibold leading-none tracking-[-0.06em] sm:text-6xl">
                  <ScrollText>
                    Rõ ràng ở phần nhìn.
                    <br />
                    <span className="text-white/40">Sâu sắc ở phần dùng.</span>
                  </ScrollText>
                </h2>
              </div>
              <p className="max-w-xs text-sm leading-6 text-white/50">
                Từ một ý tưởng còn mơ hồ đến một sản phẩm có thể chạm, dùng và yêu thích.
              </p>
            </div>
          </Reveal>
          <div className="grid border-t border-white/15 md:grid-cols-3">
            {services.map((service, index) => (
              <Reveal
                key={service.number}
                className={`border-b border-white/15 py-8 md:border-b-0 md:py-10 ${index > 0 ? "md:border-l md:pl-8" : "md:pr-8"}`}
              >
                <span className="text-xs text-[#70a6ff]">{service.number}</span>
                <h3 className="mt-14 text-2xl font-medium tracking-[-0.04em]">{service.title}</h3>
                <p className="mt-4 max-w-xs text-sm leading-6 text-white/50">{service.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
        <WaveDivider fill="#f5f5f2" />
      </section>

      <section className="relative mx-auto max-w-7xl px-5 py-24 pb-40 sm:px-8 lg:px-12 lg:py-36 lg:pb-52">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.26em] text-[#1d65d6]">
              Một vài hướng đi
            </p>
            <h2 className="max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.06em] sm:text-7xl">
              <ScrollText>
                Mỗi sản phẩm là một cách <span className="text-[#1d65d6]">kể chuyện.</span>
              </ScrollText>
            </h2>
            <p className="mt-7 max-w-lg text-base leading-7 text-black/60">
              Từng trải nghiệm được xây từ bối cảnh riêng: nhịp điệu của thời trang, sự tin cậy của
              giáo dục, tốc độ của bán hàng hay sự an tâm trong một ngôi nhà thông minh.
            </p>
          </Reveal>
          <Reveal className="relative min-h-[330px]">
            <Image
              src="/woman-hello.png"
              alt="Người dùng chào trong một không gian giáo dục hiện đại"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="rounded-[2rem] object-cover"
            />
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#dbeafe] px-5 pb-2 pt-32 sm:px-8 lg:px-12 lg:pb-10 lg:pt-40">
        <div className="mx-auto grid max-w-7xl items-end gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal className="relative z-10 pb-20 lg:pb-36">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.26em] text-[#1d65d6]">
              Cùng biến ý tưởng thành hiện thực
            </p>
            <h2 className="max-w-xl text-5xl font-semibold leading-[0.98] tracking-[-0.07em] sm:text-7xl">
              <ScrollText>
                Bạn có một ý tưởng cần được <span className="text-[#1d65d6]">lắng nghe?</span>
              </ScrollText>
            </h2>
            <Link
              href="/products"
              className="mt-9 inline-flex rounded-full bg-[#171717] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#1d65d6]"
            >
              Bắt đầu trò chuyện ↗
            </Link>
          </Reveal>
          <Reveal className="relative min-h-[380px] lg:min-h-[530px]">
            <SocialNetwork />
            <Image
              src="/woman-show-app.png"
              alt="Người dùng hào hứng với một ứng dụng di động"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain object-bottom -translate-y-14 scale-[1.14] lg:-translate-y-20 lg:scale-[1.22]"
            />
          </Reveal>
        </div>
        <WaveDivider fill="#f5f5f2" />
      </section>

      <section className="relative bg-[#f5f5f2] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <Reveal>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.26em] text-[#1d65d6]">
              Liên hệ
            </p>
            <h2 className="max-w-xl text-4xl font-semibold leading-[1.02] tracking-[-0.06em] sm:text-6xl">
              <ScrollText>
                Cùng tạo nên điều <span className="text-[#1d65d6]">đáng nhớ.</span>
              </ScrollText>
            </h2>
            <p className="mt-6 max-w-md text-base leading-7 text-black/60">
              Để lại thông tin, mình sẽ phản hồi sớm nhất để cùng lắng nghe và tìm ra hướng đi phù
              hợp cho dự án của bạn.
            </p>
            <div className="mt-8 space-y-2 text-sm text-black/45">
              <p>lmqiuhdev@gmail.com</p>
              <a href="tel:0814111321" className="block hover:text-[#1d65d6]">
                0814111321
              </a>
            </div>
          </Reveal>
          <Reveal className="rounded-[2rem] bg-white p-6 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)] sm:p-8">
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f5f5f2]" />}>
      <HomeContent />
    </Suspense>
  );
}
