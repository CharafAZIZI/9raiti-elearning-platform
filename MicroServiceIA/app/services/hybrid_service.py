class HybridService:

    def compute(self, collab_score, content_score, popularity_score):

        return (
            collab_score * 0.5 +
            content_score * 0.3 +
            popularity_score * 0.2
        )