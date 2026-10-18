"""Roadmap Context Extractor for Technea AI Mentor.

Deeply inspects active user roadmaps, parses structured phase and milestone hierarchies,
identifies the active learning milestone, upcoming milestone, and prerequisite requirements,
and synthesizes precise, milestone-aware context for AI reasoning.
"""

from typing import Any


class RoadmapContextExtractor:
    """Extracts deep milestone context, current goals, and prerequisite chains from active roadmaps."""

    @staticmethod
    def extract(roadmap: Any) -> dict[str, Any]:
        """Extract comprehensive milestone-level context from a UserGeneratedRoadmap model or dict.

        Args:
            roadmap: UserGeneratedRoadmap instance or dictionary representation.

        Returns:
            Dictionary containing:
            - roadmap_id: Identifier
            - roadmap_title: Roadmap name
            - roadmap_goal: Target career/technical goal
            - target_role: Target engineering role
            - total_milestones: Total milestone count
            - completed_count: Number of completed milestones
            - completed_milestones: List of completed milestone titles
            - current_milestone: Detailed dict of the active milestone
            - current_milestone_title: Title of current milestone
            - current_milestone_description: Actionable description of current milestone
            - upcoming_milestone: Detailed dict of the upcoming milestone
            - upcoming_milestone_title: Title of next milestone
            - required_prerequisites: Prerequisites required for current milestone
            - current_key_skills: Skills acquired in current milestone
            - current_action_items: Practical tasks in current milestone
            - current_project: Hands-on project attached to current milestone
            - formatted_guidance: Pre-formatted mentor guidance string
        """
        if not roadmap:
            return {}

        # Resolve roadmap fields whether model or dict
        if isinstance(roadmap, dict):
            r_id = roadmap.get("id")
            title = roadmap.get("title", "Active Roadmap")
            goal = roadmap.get("goal", "Engineering Mastery")
            target_role = roadmap.get("target_role") or title
            roadmap_data = roadmap.get("roadmap_data") or {}
            completed_ids_raw = roadmap.get("completed_milestone_ids") or []
        else:
            r_id = getattr(roadmap, "id", None)
            title = getattr(roadmap, "title", "Active Roadmap")
            goal = getattr(roadmap, "goal", "Engineering Mastery")
            target_role = getattr(roadmap, "target_role", None) or title
            roadmap_data = getattr(roadmap, "roadmap_data", None) or {}
            completed_ids_raw = getattr(roadmap, "completed_milestone_ids", None) or []

        if not isinstance(roadmap_data, dict):
            roadmap_data = {}

        completed_ids_set = {str(cid) for cid in completed_ids_raw}

        # Flatten all milestones across all phases in sequential order
        flat_milestones: list[dict[str, Any]] = []
        phases = roadmap_data.get("phases", [])
        if isinstance(phases, list):
            for phase in phases:
                if not isinstance(phase, dict):
                    continue
                p_milestones = phase.get("milestones", [])
                if isinstance(p_milestones, list):
                    for m in p_milestones:
                        if not isinstance(m, dict):
                            continue
                        m_id = str(m.get("id", f"m-{len(flat_milestones)+1}"))
                        is_done = m_id in completed_ids_set
                        flat_milestones.append({
                            "id": m_id,
                            "step_number": m.get("step_number", len(flat_milestones) + 1),
                            "title": m.get("title", f"Milestone {len(flat_milestones) + 1}"),
                            "description": m.get("description", ""),
                            "estimated_weeks": m.get("estimated_weeks", "1-2 Weeks"),
                            "category": m.get("category", "Core"),
                            "key_skills": m.get("key_skills", []) or [],
                            "prerequisites": m.get("prerequisites", []) or [],
                            "action_items": m.get("action_items", []) or [],
                            "learning_path_id": m.get("learning_path_id"),
                            "learning_path_title": m.get("learning_path_title"),
                            "courses": m.get("courses", []) or [],
                            "project": m.get("project"),
                            "is_completed": is_done,
                            "phase_title": phase.get("title", ""),
                        })

        total_milestones = len(flat_milestones)
        completed_titles = [m["title"] for m in flat_milestones if m["is_completed"]]
        completed_count = len(completed_titles)

        # Locate active milestone (first non-completed milestone)
        current_milestone: dict[str, Any] | None = None
        upcoming_milestone: dict[str, Any] | None = None
        current_idx = -1

        for idx, m in enumerate(flat_milestones):
            if not m["is_completed"]:
                current_milestone = m
                current_idx = idx
                break

        # If all completed or none found, fallback
        if current_milestone is None and flat_milestones:
            current_milestone = flat_milestones[-1]
            current_idx = len(flat_milestones) - 1

        if current_idx >= 0 and current_idx + 1 < len(flat_milestones):
            upcoming_milestone = flat_milestones[current_idx + 1]

        # Extract specific milestone attributes
        cur_title = current_milestone.get("title", "Foundations") if current_milestone else "Foundations"
        cur_desc = current_milestone.get("description", "") if current_milestone else ""
        up_title = upcoming_milestone.get("title", "") if upcoming_milestone else ""
        prereqs = current_milestone.get("prerequisites", []) if current_milestone else []
        skills = current_milestone.get("key_skills", []) if current_milestone else []
        action_items = current_milestone.get("action_items", []) if current_milestone else []
        project = current_milestone.get("project") if current_milestone else None

        # Build clean formatted guidance
        guidance_parts = [f"Your current milestone is **{cur_title}**."]
        if cur_desc:
            clean_desc = cur_desc.rstrip(".")
            guidance_parts.append(f"Focus on {clean_desc}.")
        if project and isinstance(project, dict) and project.get("title"):
            guidance_parts.append(f"Build the practical deliverable: **{project['title']}**.")

        formatted_guidance = " ".join(guidance_parts)

        return {
            "roadmap_id": r_id,
            "roadmap_title": title,
            "roadmap_goal": goal,
            "target_role": target_role,
            "total_milestones": total_milestones,
            "completed_count": completed_count,
            "completed_milestones": completed_titles,
            "current_milestone": current_milestone,
            "current_milestone_title": cur_title,
            "current_milestone_description": cur_desc,
            "upcoming_milestone": upcoming_milestone,
            "upcoming_milestone_title": up_title,
            "required_prerequisites": prereqs,
            "current_key_skills": skills,
            "current_action_items": action_items,
            "current_project": project,
            "all_milestones": flat_milestones,
            "formatted_guidance": formatted_guidance,
        }


# Global singleton instance
roadmap_context_extractor = RoadmapContextExtractor()
