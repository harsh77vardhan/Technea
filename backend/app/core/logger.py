"""Centralized logging configuration."""

import logging
import sys
from app.core.config import settings


def setup_logging() -> None:
    """Configure application loggers with unified formatting."""
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO

    logging_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "standard": {
                "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
        },
        "handlers": {
            "default": {
                "level": log_level,
                "formatter": "standard",
                "class": "logging.StreamHandler",
                "stream": sys.stdout,
            },
        },
        "loggers": {
            "": {
                "handlers": ["default"],
                "level": log_level,
                "propagate": True,
            },
            "uvicorn": {
                "handlers": ["default"],
                "level": log_level,
                "propagate": False,
            },
            "uvicorn.error": {
                "level": log_level,
                "propagate": True,
            },
            "uvicorn.access": {
                "handlers": ["default"],
                "level": logging.INFO,
                "propagate": False,
            },
            "sqlalchemy.engine": {
                "handlers": ["default"],
                "level": logging.INFO if settings.DB_ECHO else logging.WARNING,
                "propagate": False,
            },
        },
    }

    import logging.config

    logging.config.dictConfig(logging_config)


logger = logging.getLogger("technea")
