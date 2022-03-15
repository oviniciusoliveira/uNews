import { screen, render } from "@testing-library/react";
import PostPreview, { getStaticProps } from "../../pages/posts/preview/[slug]";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { PrismicClient } from "../../services/prismic";

jest.mock("../../services/prismic");
jest.mock("next-auth/react");
jest.mock("next/router");

describe("<PostPreview />", () => {
  const post = {
    slug: "test-post",
    title: "Fake Post Title",
    content: "<p>Fake post content</p>",
    updatedAt: "02 de fevereiro de 2021",
  };

  it("should renders correctly", () => {
    const useSessionMocked = jest.mocked(useSession);
    useSessionMocked.mockReturnValueOnce({
      data: {
        activeSubscription: false,
      },
    } as any);

    render(<PostPreview post={post} />);

    expect(screen.getByText("Fake Post Title")).toBeInTheDocument();
    expect(screen.getByText("Fake post content")).toBeInTheDocument();
    expect(screen.getByText("02 de fevereiro de 2021")).toBeInTheDocument();
    expect(screen.getByText("Wanna continue reading?")).toBeInTheDocument();
  });

  it("should redirect user to post when user is subscribed", () => {
    const useRouterMocked = jest.mocked(useRouter);
    const useSessionMocked = jest.mocked(useSession);
    const pushMocked = jest.fn();

    useRouterMocked.mockReturnValueOnce({
      push: pushMocked,
    } as any);

    useSessionMocked.mockReturnValue({
      data: {
        activeSubscription: "fake-subscription",
      },
    } as any);

    render(<PostPreview post={post} />);

    expect(pushMocked).toHaveBeenCalledWith("/posts/test-post");
  });

  it("should load initial post data from getStaticProps", async () => {
    const prismisClientMocked = jest.mocked(PrismicClient);
    prismisClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [
            {
              type: "heading",
              text: "Fake Post Title",
            },
          ],
          content: [
            {
              type: "paragraph",
              text: "Fake post 1 content",
              spans: [],
            },
          ],
        },
        last_publication_date: "03-02-2021",
      }),
    } as any);

    const response = await getStaticProps({
      params: {
        slug: "fake-post-1",
      },
    });

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: "fake-post-1",
            title: "Fake Post Title",
            content: "<p>Fake post 1 content</p>",
            updatedAt: "02 de março de 2021",
          },
        },
      })
    );
  });
});
