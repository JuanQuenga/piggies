"use client";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-4">About Piggies</h1>
      <p className="text-lg mb-6">
        Piggies is a modern location-based social networking app built with
        Next.js, featuring real-time messaging, user discovery, and interactive
        maps.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Features</h2>
      <ul className="list-disc list-inside mb-6">
        <li>Real-time messaging with Convex</li>
        <li>User discovery based on proximity</li>
        <li>Interactive maps with real-time location tracking</li>
        <li>Profile management with customizable avatars</li>
      </ul>
      <h2 className="text-2xl font-semibold mb-2">Our Mission</h2>
      <p className="text-lg mb-6">
        Our mission is to connect people in meaningful ways through technology,
        enabling real-time interactions and fostering community.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Contact Us</h2>
      <p className="text-lg">
        For more information, feel free to reach out to us at{" "}
        <a href="mailto:support@piggies.com" className="text-blue-500">
          support@piggies.com
        </a>
        .
      </p>
    </div>
  );
}
