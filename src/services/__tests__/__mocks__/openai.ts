class OpenAI {
  embeddings = {
    create: jest.fn().mockResolvedValue({
      data: [
        {
          embedding: [0.1, 0.2, 0.3],
        },
      ],
    }),
  };
}

export default OpenAI; 