class ColdStartService:

    def recommend(self, df):

        # top cours populaires
        top_courses = (
            df.groupby("coursId")["score"]
            .sum()
            .sort_values(ascending=False)
            .head(5)
        )

        return [
            {"coursId": int(k), "score": float(v)}
            for k, v in top_courses.items()
        ]