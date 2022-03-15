import Posts, { getStaticProps } from "../../pages/posts";
import { render, screen } from "@testing-library/react";
import { PrismicClient } from "../../services/prismic";

jest.mock("../../services/prismic");

describe("<Posts />", () => {
  const posts = [
    {
      slug: "post-1",
      title: "Post 1",
      excerpt: "Post 1 excerpt",
      updatedAt: "1 de janeiro de 2022",
    },
  ];

  it("should renders corrrectly", () => {
    render(<Posts posts={posts} />);

    expect(screen.getByText("Post 1")).toBeInTheDocument();
    expect(screen.getByText("Post 1 excerpt")).toBeInTheDocument();
    expect(screen.getByText("1 de janeiro de 2022")).toBeInTheDocument();
  });

  it("should load initial data from getStaticProps", async () => {
    const prismicClientMocked = jest.mocked(PrismicClient);
    prismicClientMocked.mockReturnValueOnce({
      query: jest.fn().mockResolvedValueOnce({
        results: [
          {
            uid: "post-1",
            data: {
              title: [
                {
                  type: "heading",
                  text: "Post 1",
                },
              ],
              content: [
                {
                  type: "paragraph",
                  text: "Post 1 excerpt",
                },
              ],
            },
            last_publication_date: "01-01-2022",
          },
        ],
      }),
    } as any);

    const response = await getStaticProps(null);

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          posts: [
            {
              slug: "post-1",
              title: "Post 1",
              excerpt: "Post 1 excerpt",
              updatedAt: "01 de janeiro de 2022",
            },
          ],
        },
      })
    );
  });
});
