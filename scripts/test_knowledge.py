"""Tests operate on in-memory draft fixtures; they never approve real notes."""
import unittest
from pathlib import Path
from validate_knowledge import validate_note, engine_parameters

ROOT = Path(__file__).resolve().parents[1]


class KnowledgeGateTest(unittest.TestCase):
    def setUp(self):
        self.text = (ROOT/'docs/knowledge/caching.md').read_text(encoding='utf-8')
        self.parameters = engine_parameters()

    def check(self, text, publish=False):
        return validate_note(text,'caching',self.parameters,publish)[0]

    def test_valid_draft_can_be_reviewed_without_publication(self):
        self.assertEqual([],self.check(self.text))

    def test_unverified_draft_cannot_be_published(self):
        self.assertTrue(any('Publication blocked' in e for e in self.check(self.text,True)))

    def test_status_cannot_bypass_owner_verification(self):
        self.assertTrue(any('not owner verified' in e for e in self.check(self.text.replace('status: draft','status: published'))))

    def test_verified_flag_requires_reviewer_and_date(self):
        errors=self.check(self.text.replace('verified: no','verified: yes'))
        self.assertTrue(any('reviewer' in e for e in errors))
        self.assertTrue(any('ISO' in e for e in errors))

    def test_unknown_parameters_and_sources_are_rejected(self):
        self.assertTrue(self.check(self.text.replace('hitRatio','inventedParameter')))
        self.assertTrue(self.check(self.text.replace('sources: [SDI1]','sources: [UNKNOWN]')))

    def test_missing_source_or_section_is_rejected(self):
        self.assertTrue(self.check(self.text.replace('Source: SDI1, PDF page 20.','No source recorded.')))
        self.assertTrue(self.check(self.text.replace('## Failure modes','## Unrelated heading')))

    def test_book_quote_blocks_are_not_accepted(self):
        self.assertTrue(self.check(self.text+'\n> Copied material must not be published.\n'))


if __name__ == '__main__':
    unittest.main(verbosity=2)
