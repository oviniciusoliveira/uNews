import Post, { getServerSideProps } from "../../pages/posts/[slug]";
import { render, screen } from "@testing-library/react";
import { PrismicClient } from "../../services/prismic";
import { getSession } from "next-auth/react";

jest.mock("../../services/prismic");
jest.mock("next-auth/react");

describe("<Posts />", () => {
  const post = {
    slug: "post-1",
    title: "Post 1",
    content: "<p>Post 1 content</p>",
    updatedAt: "1 de janeiro de 2022",
  };

  it("should renders corrrectly", () => {
    render(<Post post={post} />);

    expect(screen.getByText("Post 1")).toBeInTheDocument();
    expect(screen.getByText("Post 1 content")).toBeInTheDocument();
    expect(screen.getByText("1 de janeiro de 2022")).toBeInTheDocument();
  });

  it("should redirects user if no active subscription is found", async () => {
    const getSessionMocked = jest.mocked(getSession);
    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: false,
    } as any);

    const response = await getServerSideProps({
      params: {
        slug: "post-1",
      },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        redirect: {
          destination: "/",
          permanent: false,
        },
      })
    );
  });

  it("should load initial data from getServerSideProps", async () => {
    const getSessionMocked = jest.mocked(getSession);
    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: "fake-active-subscription",
    } as any);

    const prismicClientMocked = jest.mocked(PrismicClient);

    prismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
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
              text: "Post 1 content",
              spans: [],
            },
          ],
        },
        last_publication_date: "01-03-2022",
      }),
    } as any);

    const response = await getServerSideProps({
      params: {
        slug: "post-1",
      },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: "post-1",
            title: "Post 1",
            content: "<p>Post 1 content</p>",
            updatedAt: "03 de janeiro de 2022",
          },
        },
      })
    );
  });
});
