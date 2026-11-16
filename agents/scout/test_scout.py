import unittest
from scout import classify, seconds


class ScoutTests(unittest.TestCase):
    def test_unknown_location_stays_unresolved(self):
        result = classify({"snippet": {"title": "Motorcycle guided tour",
                                      "description": "Beautiful roads"}}, ["Verdon"])
        self.assertEqual(result["region_match"], "unresolved")
        self.assertEqual(result["editorial_status"], "pending_review")

    def test_both_offers_and_hotel_can_coexist(self):
        result = classify({"snippet": {"title": "Verdon motorcycle guided tour",
                                      "description": "Self-guided GPX and hotel tips"}}, ["Verdon"])
        self.assertEqual(result["region_match"], "metadata_candidate")
        self.assertIn("guided_candidate", result["catalogue_tags"])
        self.assertIn("self_guided_candidate", result["catalogue_tags"])
        self.assertIn("hotel_tip_candidate", result["catalogue_tags"])

    def test_alias_is_not_a_substring(self):
        result = classify({"snippet": {"title": "Sellaronda motorcycle"}}, ["Sella"])
        self.assertEqual(result["region_match"], "unresolved")

    def test_self_guided_is_not_guided(self):
        result = classify({"snippet": {"title": "Verdon self-guided tour",
                                      "description": "Motorcycle GPX"}}, ["Verdon"])
        self.assertIn("self_guided_candidate", result["catalogue_tags"])
        self.assertNotIn("guided_candidate", result["catalogue_tags"])

    def test_duration(self):
        self.assertEqual(seconds("PT1H2M3S"), 3723)
        self.assertEqual(seconds("PT45S"), 45)
        self.assertIsNone(seconds("unknown"))


if __name__ == "__main__":
    unittest.main()
