import Image from "next/image";

const App = () => {
  return (
    <div className="container mx-auto px-4 py-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-white">
          About Kalida
        </h1>

        {/* Hero section with image and introductory text */}
        <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
          <div className="relative h-60 md:h-60 rounded-lg overflow-hidden shadow-lg">
            {/* Using a placeholder image for demonstration as next/image is not supported here */}
            <Image
              src="/logo.jpeg"
              alt="Meal & Dealz Platform"
              fill
              className="object-fill"
              priority
            />
          </div>
          <div className="space-y-4">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Welcome to <b>Kalida</b>, the leading distributor of high-quality
              construction materials. We are committed to providing excellent
              materials of the highest quality and serving the diverse needs of
              the hospitality, commercial, residential, and medical sectors. Our
              comprehensive services cover a wide range of products, including
              tiles, marble, sanitary fixtures, and lighting.
            </p>
          </div>
        </div>

        {/* Mission, Services, and Customer Commitment sections */}
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
              Our Mission
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              At Kalida, our mission is to provide our clients with top-tier
              materials, combined with exceptional customer service and
              professionalism, all at reasonable prices. With an unwavering
              focus on quality and service excellence, we strive to create a
              lasting legacy in the construction industry. We firmly believe
              that every project holds the potential for greatness, and by
              partnering with Kalida, we are dedicated to transforming visions
              into reality.
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
              Our Comprehensive Services
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              We offer a wide range of services tailored to meet the unique
              requirements of our clients. Our expert team is equipped to supply
              and deliver building materials that align precisely with project
              specifications. Furthermore, our engineering professionals are
              readily available to provide comprehensive support and advice
              during every phase of project development.
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
              Customer Commitment
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              We also take pride in our after-sale follow-up and maintenance
              services, ensuring that our customers&apos; satisfaction remains
              paramount.
            </p>
          </div>
        </div>

        {/* Specialties Section - Modernized */}
        <div className="mt-12 bg-card p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
            Our Specialties
          </h2>
          {/* Using an unordered list with grid layout for a cleaner, modern look */}
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              {/* Modern SVG bullet point */}
              <svg
                className="w-3 h-3 mt-1 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.683-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.565-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
              </svg>
              <span>
                Exclusive Distribution of High-End Construction Materials
              </span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-3 h-3 mt-1 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.683-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.565-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
              </svg>
              <span>Premium Porcelain and Ceramic Tiles</span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-3 h-3 mt-1 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.683-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.565-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
              </svg>
              <span>Sanitary Fixtures and Lavatories</span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-3 h-3 mt-1 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.683-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.565-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
              </svg>
              <span>
                Wellness Solutions for Hospitality and Residential Projects
              </span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-3 h-3 mt-1 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.683-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.565-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
              </svg>
              <span>Lighting Fixtures and Accessories</span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-3 h-3 mt-1 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.683-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.565-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
              </svg>
              <span>Woodworks and Parquet Flooring</span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-3 h-3 mt-1 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.683-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.565-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
              </svg>
              <span>Comprehensive Customer Service and Professionalism</span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-3 h-3 mt-1 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.683-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.565-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
              </svg>
              <span>Engineering Support and Advice</span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-3 h-3 mt-1 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.683-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.565-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
              </svg>
              <span>After-Sale Follow-Up and Maintenance Services</span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-3 h-3 mt-1 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.683-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.565-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
              </svg>
              <span>
                Collaborative Partnerships with Leading Hotel and Resort Brands
              </span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-3 h-3 mt-1 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.683-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.565-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
              </svg>
              <span>Successful Project Completion in Diverse Sectors</span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-3 h-3 mt-1 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.683-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.565-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
              </svg>
              <span>Unparalleled Quality and Service Excellence</span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-3 h-3 mt-1 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.683-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.565-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
              </svg>
              <span>Expertise in UAE and Saudi Arabian Markets</span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-3 h-3 mt-1 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.683-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.565-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
              </svg>
              <span>Customized Solutions for Unique Project Requirements</span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-3 h-3 mt-1 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.683-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.565-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
              </svg>
              <span>Global Network and International Project Experience</span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-3 h-3 mt-1 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.683-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.565-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
              </svg>
              <span>Commitment to Making Extraordinary Projects a Reality</span>
            </li>
          </ul>
        </div>
        {/* New Contact Us Section */}

        {/* Feature Highlights section (retained) */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-card rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
              Comprehensive Services
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Supply & delivery of building materials for diverse sectors.
            </p>
          </div>
          <div className="text-center p-6 bg-card rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
              Quality Materials
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Top-tier construction materials, including tiles, marble,
              lighting.
            </p>
          </div>
          <div className="text-center p-6 bg-card rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
              Expert Support
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Engineering advice and dedicated after-sale follow-up.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
