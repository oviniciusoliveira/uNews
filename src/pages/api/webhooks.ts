import { NextApiRequest, NextApiResponse } from "next";

export default function (req: NextApiRequest, res: NextApiResponse) {
  console.log("[webhook] stripe evento recebido");

  res.status(200).json({ ok: true });
}
