import { defineConfig } from "vitest/config";

// 날짜 계산은 PC의 현지 시간 기준이라, 어느 PC에서 돌려도 같은 결과가 나오게 시간대를 고정한다.
process.env.TZ = "Asia/Seoul";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
