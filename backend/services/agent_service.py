import asyncio
from datetime import datetime, timezone
from typing import Dict
from uuid import uuid4

from models.schemas import CrisisRequest, CrisisSessionResponse


class AIBoardroomManager:
    async def run_bot_agent(
        self,
        bot_name: str,
        system_role: str,
        category: str,
        crisis: str,
        context: str,
    ) -> str:
        await asyncio.sleep(0.15)

        normalized_name = bot_name.lower()

        if "financial" in normalized_name:
            return (
                "## Financial Manager Analysis\n\n"
                f"Business category reviewed: **{category}**.\n\n"
                "### Immediate Financial Priorities\n"
                "- Initiate a temporary budget freeze on non-essential spending within 24 hours.\n"
                "- Preserve payroll, critical vendor payments, security, compliance, and revenue-generating operations.\n"
                "- Reforecast cash runway using current cash balance, weekly burn, receivables timing, churn risk, and emergency costs.\n"
                "- Create three liquidity scenarios: conservative, expected, and severe downside.\n"
                "- Contact key vendors to renegotiate payment schedules, reduce minimum commitments, or defer renewals.\n\n"
                "### Revenue Protection\n"
                "- Identify the top customers or channels most exposed to the crisis.\n"
                "- Prioritize retention offers for high-margin accounts.\n"
                "- Pause low-return marketing spend and redirect budget to measurable conversion channels.\n\n"
                "### Financial Control Recommendation\n"
                "For the next 30 days, every expense above a defined approval threshold should require executive review. "
                "The company should track daily cash movement and review runway twice per week until stability returns."
            )

        if "legal" in normalized_name:
            return (
                "## Legal Expert Analysis\n\n"
                f"Business category reviewed: **{category}**.\n\n"
                "### Contractual And Compliance Priorities\n"
                "- Review customer, vendor, lease, lending, insurance, and employment agreements for notice obligations.\n"
                "- Evaluate whether force majeure, hardship, termination, cure-period, or service-level clauses apply.\n"
                "- Preserve written records of board decisions, customer communications, employee notices, and vendor negotiations.\n"
                "- Confirm whether the crisis triggers regulatory reporting, data protection, consumer protection, licensing, or labor-law obligations.\n\n"
                "### Risk Controls\n"
                "- Avoid public commitments before legal review if they could create liability or misleading expectations.\n"
                "- Ensure employee scheduling, layoffs, furloughs, and pay changes comply with applicable labor laws.\n"
                "- Review insurance policies for business interruption, cyber, liability, or errors-and-omissions coverage.\n\n"
                "### Legal Recommendation\n"
                "The company should send only reviewed communications to customers, vendors, staff, lenders, and regulators. "
                "Where contracts mention force majeure or notice windows, notices should be prepared immediately and reviewed by qualified counsel."
            )

        if "project" in normalized_name or "manager" in normalized_name:
            return (
                "## Project Manager Execution Roadmap\n\n"
                f"Business category reviewed: **{category}**.\n\n"
                "### 0-48 Hours\n"
                "- Appoint a crisis lead with authority to coordinate finance, legal, operations, customer success, and communications.\n"
                "- Open a single crisis command channel and decision log.\n"
                "- Freeze non-essential spending and publish temporary approval rules.\n"
                "- Begin legal review of contracts, notice obligations, and force majeure options.\n\n"
                "### Days 3-7\n"
                "- Build a 13-week cash forecast and identify the minimum viable operating budget.\n"
                "- Rank vendors, customers, products, and obligations by criticality.\n"
                "- Prepare customer and vendor communication templates approved by legal.\n"
                "- Assign accountable owners for cash preservation, contract review, staffing, operations, and customer retention.\n\n"
                "### Days 8-30\n"
                "- Execute vendor renegotiations and customer retention campaigns.\n"
                "- Reduce or pause initiatives that do not support survival, compliance, or near-term revenue.\n"
                "- Monitor KPIs weekly: cash runway, weekly burn, retained revenue, open legal risks, vendor concessions, and operational uptime.\n"
                "- Deliver a weekly recovery review to leadership with decisions, risks, blockers, and next actions.\n\n"
                "### Roadmap Principle\n"
                "The recovery plan should protect cash first, reduce legal exposure second, and then rebuild operating momentum through focused execution."
            )

        return (
            f"## {bot_name} Analysis\n\n"
            f"Role: {system_role}\n\n"
            f"Business category: **{category}**.\n\n"
            f"Crisis reviewed: {crisis}\n\n"
            f"Context considered: {context}"
        )

    async def process_crisis_boardroom(
        self,
        request: CrisisRequest,
    ) -> CrisisSessionResponse:
        session_id = str(uuid4())
        created_at = datetime.now(timezone.utc)

        financial_response = await self.run_bot_agent(
            bot_name="Financial Manager",
            system_role="Analyze liquidity, budget control, runway, burn rate, and financial survival strategy.",
            category=request.business_category,
            crisis=request.crisis_description,
            context="No prior bot context. This is the first specialist review.",
        )

        legal_response = await self.run_bot_agent(
            bot_name="Legal Expert",
            system_role="Analyze compliance, contracts, liability, force majeure, documentation, and regulatory obligations.",
            category=request.business_category,
            crisis=request.crisis_description,
            context=financial_response,
        )

        project_manager_response = await self.run_bot_agent(
            bot_name="Project Manager",
            system_role="Convert specialist recommendations into an executable crisis recovery roadmap.",
            category=request.business_category,
            crisis=request.crisis_description,
            context=f"{financial_response}\n\n{legal_response}",
        )

        bot_consultations: Dict[str, str] = {
            "Financial Manager": financial_response,
            "Legal Expert": legal_response,
            "Project Manager": project_manager_response,
        }

        final_recovery_plan = (
            "# Master Recovery Strategy\n\n"
            f"**Business Category:** {request.business_category}\n\n"
            f"**Crisis Summary:** {request.crisis_description}\n\n"
            "## Executive Direction\n\n"
            "The business should immediately stabilize liquidity, reduce avoidable legal exposure, "
            "protect essential operations, and execute a focused 30-day recovery cadence. "
            "The response should be centralized through one accountable crisis lead and supported by "
            "a daily decision log.\n\n"
            "## Specialist Findings\n\n"
            f"{financial_response}\n\n"
            f"{legal_response}\n\n"
            f"{project_manager_response}\n\n"
            "## Integrated Action Plan\n\n"
            "### First 48 Hours\n"
            "1. Freeze non-essential spending and define approval thresholds.\n"
            "2. Start legal review of contracts, force majeure rights, notice windows, and compliance obligations.\n"
            "3. Create a crisis command channel, decision log, and executive update rhythm.\n"
            "4. Identify critical customers, vendors, staff, systems, and cash commitments.\n\n"
            "### First 7 Days\n"
            "1. Complete a 13-week cash forecast with downside scenarios.\n"
            "2. Prepare legally reviewed customer, vendor, employee, and lender communications.\n"
            "3. Renegotiate vendor terms and prioritize high-margin revenue protection.\n"
            "4. Assign owners for finance, legal, operations, customer retention, and communications.\n\n"
            "### First 30 Days\n"
            "1. Track weekly KPIs for runway, burn, retained revenue, vendor concessions, legal risks, and operational stability.\n"
            "2. Stop or defer low-return projects until the business regains stability.\n"
            "3. Maintain weekly leadership recovery reviews with documented decisions and blockers.\n"
            "4. Convert the emergency plan into a durable operating model once the crisis stabilizes.\n\n"
            "## Success Metrics\n\n"
            "- Cash runway extended or stabilized.\n"
            "- Critical contracts reviewed and required notices sent on time.\n"
            "- Essential operations maintained without uncontrolled spend.\n"
            "- Customer retention plan active for the highest-value accounts.\n"
            "- Weekly leadership decisions documented with owners and deadlines."
        )

        return CrisisSessionResponse(
            session_id=session_id,
            business_category=request.business_category,
            crisis_description=request.crisis_description,
            bot_consultations=bot_consultations,
            final_recovery_plan=final_recovery_plan,
            created_at=created_at,
        )
