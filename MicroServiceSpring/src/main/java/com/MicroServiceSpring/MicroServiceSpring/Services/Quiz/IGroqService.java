package com.MicroServiceSpring.MicroServiceSpring.Services.Quiz;

public interface IGroqService {
    String genererQuizJson(String texte, int nombreQuestions,
                           String difficulte, String typeQuestions);
}