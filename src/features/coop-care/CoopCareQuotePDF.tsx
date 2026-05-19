import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import {
  GroupQuoteInput,
  CohortInput,
} from "../../core/schemas/coop-care.schema";
import { PremiumBreakdown } from "../../core/pricing/coop-care.engine";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica" },
  header: {
    borderBottom: "2px solid #ce1126",
    paddingBottom: 10,
    marginBottom: 20,
  },
  title: { fontSize: 24, color: "#ce1126", fontWeight: "bold" },
  subtitle: { fontSize: 14, color: "#4b5563", marginTop: 5 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    backgroundColor: "#f3f4f6",
    padding: 5,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    borderBottom: "1px solid #e5e7eb",
    paddingVertical: 5,
  },
  colTop: { fontSize: 12, fontWeight: "bold", width: "25%" },
  col: { fontSize: 12, width: "25%" },
  totalBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#eff6ff",
    borderRadius: 4,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e3a8a",
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 10,
    color: "#9ca3af",
    textAlign: "center",
    borderTop: "1px solid #e5e7eb",
    paddingTop: 10,
  },
});

interface PDFProps {
  data: GroupQuoteInput;
  quote: PremiumBreakdown;
}

export const CoopCareQuotePDF = ({ data, quote }: PDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>CIC CoopCare Medical Quote</Text>
        <Text style={styles.subtitle}>Prepared for: {data.groupName}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cohort Breakdown</Text>
        <View style={styles.row}>
          <Text style={styles.colTop}>Coverage</Text>
          <Text style={styles.colTop}>Option</Text>
          <Text style={styles.colTop}>Dependents</Text>
          <Text style={styles.colTop}>Families</Text>
        </View>

        {data.cohorts.map((cohort: CohortInput, index: number) => (
          <View key={index} style={styles.row}>
            <Text style={styles.col}>
              {cohort.coverageType === "ALL_BENEFITS"
                ? "All Benefits"
                : "Inpatient Only"}
            </Text>
            <Text style={styles.col}>
              {cohort.benefitOption.replace("_", " ")}
            </Text>
            <Text style={styles.col}>{cohort.dependentCount}</Text>
            <Text style={styles.col}>{cohort.multiplier}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Premium Summary</Text>
        <View style={styles.row}>
          <Text style={{ ...styles.col, width: "75%" }}>Base Premium</Text>
          <Text style={{ ...styles.col, textAlign: "right" }}>
            Ksh {quote.basePremium.toLocaleString()}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={{ ...styles.col, width: "75%" }}>
            Training Levy (0.2%)
          </Text>
          <Text style={{ ...styles.col, textAlign: "right" }}>
            Ksh {quote.trainingLevy.toLocaleString()}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={{ ...styles.col, width: "75%" }}>PHCF (0.25%)</Text>
          <Text style={{ ...styles.col, textAlign: "right" }}>
            Ksh {quote.phcf.toLocaleString()}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={{ ...styles.col, width: "75%" }}>Stamp Duty</Text>
          <Text style={{ ...styles.col, textAlign: "right" }}>
            Ksh {quote.stampDuty.toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={styles.totalBox}>
        <Text style={styles.totalText}>
          Total Payable: Ksh {quote.totalPremium.toLocaleString()}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text>
          This quote is valid for 30 days. Maximum joining age is 70 years.
        </Text>
        <Text>
          Regulated by the Insurance Regulatory Authority of Kenya (IRA)
        </Text>
      </View>
    </Page>
  </Document>
);
