import Image from "next/image";
import Link from "next/link";

export default function AppDownload() {
  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Download The Mealz & Dealz App
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Mealz & Dealz is platform where all customers of restaurants &
            grocery stores can place order as per their choice, Its available in
            multiple countries, suitable for chain based restaurants, as well as
            individual restaurants where all are responsible for quality
            delivery. Mealz & Dealz is a popular 3rd-party appstore, that offers
            useful apps for iPhone and Android users for food order placement &
            online payment options as well.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6 mt-8">
            <Link
              href="https://apps.apple.com/us/app/mealz-dealz/id6740726025"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-6 py-3 bg-black text-white rounded-lg hover:bg-black/90 transition-colors"
            >
              <Image
                src="/apple-white.png"
                alt="App Store"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <div className="text-left">
                <p className="text-xs text-gray-300">Download on the</p>
                <p className="text-lg font-semibold">App Store</p>
              </div>
            </Link>

            <Link
              href="https://play.google.com/store/apps/details?id=foods.restaurants.mealzndealz"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-6 py-3 bg-black text-white rounded-lg hover:bg-black/90 transition-colors"
            >
              <Image
                src="/google.png"
                alt="Google Play"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <div className="text-left">
                <p className="text-xs text-gray-300">Get it on</p>
                <p className="text-lg font-semibold">Google Play</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
