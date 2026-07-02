# MongoDB container configuration

The authentication module uses single-document atomic operations and can run against this
standalone development instance. Replica-set initialization will be added before wallet and
payment persistence because multi-document MongoDB transactions require it.
