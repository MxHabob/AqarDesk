import LoginTestimonials from "@/components/login-testimonials"

export function LoginVideoBackground() {
  return (
    <aside className="relative m-2 hidden min-h-[calc(100svh-1rem)] w-1/2 overflow-hidden lg:flex">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/bg-login-indigo.jpg')" }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-black/20" />
      <div className="relative z-10 flex h-full w-full items-center justify-center p-8 text-center">
        <div className="max-w-lg">
          <LoginTestimonials />
        </div>
      </div>
    </aside>
  )
}
