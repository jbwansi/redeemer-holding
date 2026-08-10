# Future certificate eligibility

Certificates remain disabled through `features.certificates_enabled` and no eligibility rule is active.

The LMS currently exposes two independent facts:

- `LearningProgressService::isCompleted()` confirms that every published lesson in a published section is complete;
- published quizzes belong to sections, store their passing score, and passed attempts can be identified per user.

There is no global final-quiz marker. A future implementation may identify the last published section and its published quiz using the existing section order, but that would be a product convention rather than an existing business rule.

The product decision must choose one option before certificate generation is implemented:

1. lessons only: use `isCompleted()`;
2. lessons plus the last published section quiz: require `isCompleted()` and a passed attempt for that quiz;
3. lessons plus every published required quiz: require `isCompleted()` and a passed attempt for each quiz. The data model does not currently distinguish required and optional quizzes, so this option needs an explicit rule or field first.

No certificate route, table, event, PDF, QR code, number, or user interface should be added until that decision is made and the feature flag is enabled deliberately.
