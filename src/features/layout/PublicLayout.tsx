// src/features/layout/PublicLayout.tsx
import { Outlet } from "react-router-dom";
import { Box, Container } from "@mui/material";

export function PublicLayout() {
  return (
    <Box sx={{ minHeight: "100vh", py: 6 }}>
      <Container maxWidth="sm">
        <Outlet />
      </Container>
    </Box>
  );
}
