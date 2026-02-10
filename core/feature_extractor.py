import numpy as np
from sklearn.preprocessing import normalize

class FeatureExtractor:
    def __init__(self, vulnerabilities, assets):
        self.vulnerabilities = vulnerabilities
        self.assets = assets

    def extract_embeddings(self):
        # Placeholder for feature extraction logic
        
        # Convert vulnerabilities and assets to embeddings
        # Here you can use techniques like Word2Vec, BERT, etc.
        embeddings = self._generate_embeddings()  
        return embeddings

    def _generate_embeddings(self):
        # Example logic for embedding generation
        normalized_vuls = normalize(np.array(self.vulnerabilities))
        normalized_assets = normalize(np.array(self.assets))
        return np.dot(normalized_vuls, normalized_assets.T)
