"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Star,
  Send,
  MessageSquare,
  Bug,
  Lightbulb,
  HelpCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

const feedbackTypes = [
  { value: "bug", label: "Bug Report", icon: Bug },
  { value: "feature", label: "Feature Request", icon: Lightbulb },
  {
    value: "improvement",
    label: "Improvement Suggestion",
    icon: MessageSquare,
  },
  { value: "other", label: "Other", icon: HelpCircle },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Implement your feedback submission logic here
      // await submitFeedback({ rating, feedbackType, message });

      toast.success("Thank you for your feedback!");
      setRating(0);
      setFeedbackType("");
      setMessage("");
    } catch (error) {
      console.error("Feedback submission error:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-16">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-2xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Share Your Feedback
            </h1>
            <p className="text-muted-foreground text-lg">
              Help us improve Mealz & Dealz by sharing your thoughts and
              suggestions
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-8 bg-card/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-border/50"
            variants={itemVariants}
          >
            {/* Rating Section */}
            <motion.div className="space-y-4" variants={itemVariants}>
              <label className="text-lg font-medium flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                How would you rate your experience?
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    className="focus:outline-none transform hover:scale-110 transition-transform"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Star
                      className={`w-8 h-8 transition-colors duration-200 ${
                        (hoverRating || rating) >= star
                          ? "fill-primary text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Feedback Type */}
            <motion.div className="space-y-4" variants={itemVariants}>
              <label className="text-lg font-medium">
                What type of feedback would you like to share?
              </label>
              <Select value={feedbackType} onValueChange={setFeedbackType}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select feedback type" />
                </SelectTrigger>
                <SelectContent>
                  {feedbackTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem
                        key={type.value}
                        value={type.value}
                        className="flex items-center gap-2"
                      >
                        <Icon className="w-4 h-4" />
                        {type.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </motion.div>

            {/* Message */}
            <motion.div className="space-y-4" variants={itemVariants}>
              <label className="text-lg font-medium">Your Feedback</label>
              <Textarea
                placeholder="Share your thoughts, suggestions, or report any issues..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[200px] resize-none focus:ring-2 focus:ring-primary/20"
              />
            </motion.div>

            {/* Submit Button */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                className="w-full h-12 text-lg font-medium gap-2"
                disabled={!rating || !feedbackType || !message || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Send className="w-5 h-5 animate-pulse" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </motion.div>
          </motion.form>

          {/* Additional Info */}
          <motion.div
            className="mt-12 text-center text-sm text-muted-foreground"
            variants={itemVariants}
          >
            <p>
              Your feedback helps us improve our service. We appreciate your
              time and input.
            </p>
            <p className="mt-2">
              For urgent issues, please contact our{" "}
              <a
                href="/contact"
                className="text-primary hover:underline transition-colors"
              >
                support team
              </a>
              .
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
